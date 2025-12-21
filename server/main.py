import http.server
import socketserver
import json
import sqlite3
import os
import time
import traceback
from database import init_db, get_db_connection

PORT = 3001

class APIHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')

    def send_json_response(self, data, status=200):
        self.send_response(status)
        self.send_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def send_error(self, message, status=500):
        self.send_json_response({'error': message}, status)

    def do_GET(self):
        if self.path.startswith('/uploads/'):
            try:
                if '..' in self.path:
                   self.send_error(403)
                   return
                file_path = os.path.join('server', self.path.lstrip('/'))
                if os.path.exists(file_path):
                    self.send_response(200)
                    self.send_header('Content-type', 'video/webm')
                    self.end_headers()
                    with open(file_path, 'rb') as f:
                        self.wfile.write(f.read())
                    return
            except:
                pass

        if self.path.startswith('/api/'):
            try:
                if self.path == '/api/products':
                    conn = get_db_connection()
                    products = [dict(row) for row in conn.execute("SELECT * FROM products").fetchall()]
                    conn.close()
                    self.send_json_response(products)
                
                elif self.path == '/api/customers':
                    conn = get_db_connection()
                    customers = [dict(row) for row in conn.execute("SELECT * FROM customers").fetchall()]
                    conn.close()
                    self.send_json_response(customers)

                elif self.path == '/api/orders':
                    conn = get_db_connection()
                    orders = [dict(row) for row in conn.execute("SELECT * FROM orders ORDER BY date DESC").fetchall()]
                    conn.close()
                    self.send_json_response(orders)

                elif self.path.startswith('/api/orders/'):
                    order_id = self.path.split('/')[-1]
                    conn = get_db_connection()
                    order = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
                    
                    if order:
                        order_dict = dict(order)
                        # Fetch logs
                        logs = [dict(row) for row in conn.execute("SELECT * FROM agent_logs WHERE orderId = ? ORDER BY id ASC", (order_id,)).fetchall()]
                        order_dict['logs'] = logs
                        conn.close()
                        self.send_json_response(order_dict)
                    else:
                        conn.close()
                        self.send_error("Order not found", 404)

                elif self.path == '/api/metrics':
                    conn = get_db_connection()
                    product_count = conn.execute("SELECT count(*) as count FROM products").fetchone()['count']
                    order_count = conn.execute("SELECT count(*) as count FROM orders WHERE status != 'Delivered'").fetchone()['count']
                    revenue_data = conn.execute("SELECT sum(amount) as total FROM orders").fetchone()['total']
                    conn.close()
                    
                    total_revenue = f"${revenue_data:.2f}" if revenue_data else "$0.00"
                    self.send_json_response({
                        "totalRevenue": total_revenue,
                        "activeOrders": str(order_count),
                        "productsInStock": str(product_count),
                        "newCustomers": "+12%"
                    })

                elif self.path == '/api/sales':
                    conn = get_db_connection()
                    sales = [dict(row) for row in conn.execute("SELECT date, sum(amount) as total FROM orders GROUP BY date ORDER BY date ASC LIMIT 30").fetchall()]
                    conn.close()
                    self.send_json_response(sales)
                    
                else:
                    self.send_error("Endpoint not found", 404)
                    
            except Exception as e:
                self.send_error(str(e))
        else:
            # Serve Static Files
            # Map / to index.html
            serve_path = self.path
            if serve_path == '/':
                serve_path = '/index.html'
            
            # Look in dist
            file_path = os.path.abspath(os.path.join("../dist", serve_path.lstrip('/')))
            
            # Security check
            if not file_path.startswith(os.path.abspath("../dist")):
                 self.send_error("Forbidden", 403)
                 return

            if os.path.exists(file_path) and os.path.isfile(file_path):
                self.directory = os.path.abspath("../dist")
                os.chdir(self.directory)
                super().do_GET()
                os.chdir("../server")
            else:
                # SPA Fallback for non-api routes? or just 404
                if not self.path.startswith('/api'):
                     # Serve index.html for SPA routing capability
                     index_path = os.path.abspath(os.path.join("../dist", "index.html"))
                     if os.path.exists(index_path):
                         self.directory = os.path.abspath("../dist")
                         os.chdir(self.directory)
                         self.path = '/index.html'
                         super().do_GET()
                         os.chdir("../server")
                         return
                self.send_error("File not found", 404)

    def do_POST(self):
        if self.path.startswith('/api/'):
            try:
                if self.path == '/api/orders':
                    content_length = int(self.headers['Content-Length'])
                    post_data = self.rfile.read(content_length)
                    data = json.loads(post_data.decode('utf-8'))

                    conn = get_db_connection()
                    cursor = conn.cursor()
                    
                    cust = cursor.execute("SELECT name FROM customers WHERE id = ?", (data['customerId'],)).fetchone()
                    prod = cursor.execute("SELECT name FROM products WHERE id = ?", (data['productId'],)).fetchone()
                    
                    if not cust or not prod:
                        conn.close()
                        self.send_error("Invalid customer or product ID", 400)
                        return

                    cursor.execute(
                        "INSERT INTO orders (customerId, customerName, productId, productName, quantity, amount, status, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        (data['customerId'], cust['name'], data['productId'], prod['name'], data['quantity'], data['amount'], 'Pending', data['date'])
                    )
                    conn.commit()
                    new_id = cursor.lastrowid
                    conn.close()
                    self.send_json_response({**data, "id": new_id, "status": "Pending"})

                elif self.path.startswith('/api/orders/') and self.path.endswith('/video'):
                    # Upload video
                    try:
                        order_id = self.path.split('/')[3]
                        content_length = int(self.headers.get('Content-Length'))
                        
                        file_data = self.rfile.read(content_length)
                        
                        # Ensure uploads dir exists
                        os.makedirs('server/uploads', exist_ok=True)
                        filename = f"debate_{order_id}_{int(time.time())}.webm"
                        file_path = f"server/uploads/{filename}"
                        
                        with open(file_path, 'wb') as f:
                            f.write(file_data)
                        
                        # Update DB
                        conn = get_db_connection()
                        cursor = conn.cursor()
                        # Store relative path for serving
                        video_url = f"/uploads/{filename}"
                        cursor.execute("UPDATE orders SET video_url = ? WHERE id = ?", (video_url, order_id))
                        conn.commit()
                        conn.close()
                        
                        self.send_json_response({"message": "Video uploaded", "url": video_url})
                        return
                    except Exception as e:
                        traceback.print_exc()
                        self.send_error(500, str(e))
                        return

                elif self.path.startswith('/api/orders/') and self.path.endswith('/process'):
                    order_id = self.path.split('/')[3]
                    conn = get_db_connection()
                    from agents import run_agents
                    logs = run_agents(order_id, conn)
                    conn.close()
                    self.send_json_response(logs)

                elif self.path.startswith('/api/orders/') and self.path.endswith('/status'):
                     self.send_error("Use PUT for status updates", 405)
                
                else:
                    self.send_error("Endpoint not found", 404)

            except Exception as e:
                traceback.print_exc()
                self.send_error(str(e))

    def do_PUT(self):
        if self.path.startswith('/api/orders/') and self.path.endswith('/status'):
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            order_id = self.path.split('/')[3]

            try:
                conn = get_db_connection()
                conn.execute("UPDATE orders SET status = ? WHERE id = ?", (data['status'], order_id))
                conn.commit()
                conn.close()
                self.send_json_response({"success": True, "status": data['status']})
            except Exception as e:
                self.send_error(str(e))

# Initialize DB
init_db()

print(f"Python Server running at http://localhost:{PORT}")
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), APIHandler) as httpd:
    httpd.serve_forever()
