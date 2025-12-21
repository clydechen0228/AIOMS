import sqlite3
import sys
import os

# Ensure we can import from local directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db_connection, init_db
from agents import run_agents

def debug():
    print("--- Starting Debug ---")
    
    # 1. Verify DB Table
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        table_names = [t['name'] for t in tables]
        print(f"Tables: {table_names}")
        
        if 'agent_logs' not in table_names:
            print("ERROR: agent_logs table missing! generic 'init_db' might have failed or not run.")
            # Try running init_db manually
            print("Attempting to run init_db() now...")
            conn.close()
            init_db()
            conn = get_db_connection()
            cursor = conn.cursor()
            
        # 2. Check Order
        order = cursor.execute("SELECT * FROM orders LIMIT 1").fetchone()
        if not order:
            print("No orders found to test.")
            return
            
        order_id = order['id']
        print(f"Testing with Order ID: {order_id}")
        
        # 3. Run Agents
        print("Running run_agents...")
        try:
            logs = run_agents(order_id, conn)
            print("Success! Logs generated:")
            for log in logs:
                print(log)
        except Exception as e:
            print(f"ERROR in run_agents: {e}")
            import traceback
            traceback.print_exc()

    except Exception as e:
        print(f"General Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug()
