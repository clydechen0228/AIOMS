import random

class Agent:
    def __init__(self, name):
        self.name = name

    def process(self, order, db_cursor):
        raise NotImplementedError

class InventoryAgent(Agent):
    def __init__(self):
        super().__init__("Inventory Agent")

    def process(self, order, db_cursor):
        # Simulate checking stock
        product_id = order['productId']
        product = db_cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
        
        # Ensure quantity is an integer
        qty = int(order['quantity'])
        
        if product and product['stock'] >= qty:
            action = "Stock Reserved"
            details = f"Reserved {qty} units of {product['name']}. Remaining stock: {product['stock'] - qty}."
        else:
            action = "Stock Alert"
            details = f"Insufficient stock for {product['name']}. Requested: {qty}, Available: {product['stock'] if product else 0}."
        
        return {"agentName": self.name, "action": action, "details": details}

class RiskAgent(Agent):
    def __init__(self):
        super().__init__("Risk Analysis Agent")

    def process(self, order, db_cursor):
        # Ensure amount is a float
        amount = float(order['amount'])
        
        if amount > 5000:
            action = "High Value Flag"
            details = "Order value exceeds $5,000. Manual review recommended."
        elif amount > 2000:
            action = "High Value Flag"
            details = "Order value exceeds $5,000. Manual review recommended."
        elif amount > 2000:
             action = "Medium Risk"
             details = "Order value significant. Standard fraud check passed."
        else:
            action = "Low Risk"
            details = "Low value order. Auto-approved."
            
        return {"agentName": self.name, "action": action, "details": details}

class LogisticsAgent(Agent):
    def __init__(self):
        super().__init__("Logistics Agent")

    def process(self, order, db_cursor):
        # random delivery estimate
        days = random.randint(2, 5)
        action = "Route Optimized"
        details = f"Optimal shipping route found. Estimated delivery in {days} days via Ground Shipping."
        return {"agentName": self.name, "action": action, "details": details}

def run_agents(order_id, conn):
    cursor = conn.cursor()
    order = cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    
    if not order:
        return []

    # Clear previous logs for this order to allow re-running the demo
    cursor.execute("DELETE FROM agent_logs WHERE orderId = ?", (order_id,))
    conn.commit()

    logs = []
    
    def log_event(agent_name, action, details):
        # Save to DB
        cursor.execute(
            "INSERT INTO agent_logs (orderId, agentName, action, details, timestamp) VALUES (?, ?, ?, ?, datetime('now'))",
            (order_id, agent_name, action, details)
        )
        logs.append({
            "agentName": agent_name,
            "action": action,
            "details": details,
            "timestamp": "Just now"
        })

    # ... (keeps existing setup)
    
    # ... (Inventory and Risk basic checks remain similar, but let's spice them up)
    
    # 1. Coordinator
    log_event("System", "Initialization", f"⚠ ALERT: Critical Order #{order_id} detected. Convening War Council.")

    # 2. Inventory (The Anxious One)
    inv_agent = InventoryAgent()
    qty = int(order['quantity'])
    prod_name = order['productName']
    
    log_event(inv_agent.name, "Analysis", f"Scannning warehouse sector 7... Found {qty} units of {prod_name}.")
    inv_result = inv_agent.process(order, cursor)
    
    if "Alert" in inv_result['action']:
        log_event(inv_agent.name, "Panic", "WE ARE OUT OF STOCK! ABORT! ABORT!")
        log_event("System", "Termination", "Mission failed. Order cancelled.")
        conn.commit()
        return logs
        
    log_event(inv_agent.name, "Relief", "Stock is secured. Please don't mess this up, guys.")

    # 3. Risk (The Paranoid One)
    risk_agent = RiskAgent()
    amount = float(order['amount'])
    
    log_event(risk_agent.name, "Scrutiny", f"Analyzing order value ${amount}... This looks suspicious.")
    
    # 4. Logistics (The Cowboy)
    log_agent = LogisticsAgent()
    
    if amount > 2000:
        # THE FIGHT START
        log_event(log_agent.name, "Proposal", "I've booked a Supersonic Drone. Delivery in 4 hours. Cost: $500.")
        
        log_event(risk_agent.name, "Outrage", "ARE YOU INSANE?! $500 shipping on a low-margin order? ABSOLUTELY NOT.")
        
        log_event(log_agent.name, "Retort", "We need to dominate the market! Speed is everything, you bean counter!")
        
        log_event(risk_agent.name, "Block", "I am blocking this transaction. Your recklessness is a liability.")
        
        log_event(inv_agent.name, "Interjection", "Guys, the chemicals are degrading! Make a decision!")
        
        log_event(log_agent.name, "Defiance", "I'm overriding you! Drone is launching in T-minus 10 seconds!")
        
        log_event(risk_agent.name, "Veto", "SYSTEM OVERRIDE: AUTHORIZATION CODE ALPHA-9. DRONE GROUNDED.")
        
        log_event(log_agent.name, "Defeat", "Fine! You're ruining this company. Switching to Ground Shipping. 5 days.")
        
        log_event(risk_agent.name, "Victory", "Sensible choice. Approval granted. Do not cross me again.")
    
    else:
        # Standard flow
        log_event(log_agent.name, "Boredom", "Small order. Throwing it on the standard truck.")
        log_event(risk_agent.name, "Approval", "Acceptable. Minimal risk.")
        log_event(inv_agent.name, "Happiness", "Yay! Everyone agreed!")

    conn.commit()
    
    # EXECUTION PHASE - Update Order Status based on conclusion
    final_status = "Pending"
    if "Termination" in logs[-1]['action']:
        final_status = "Cancelled"
        log_event("System", "Execution", "Order status updated to: Cancelled")
    elif "Consensus" in logs[-1]['action']:
        final_status = "Processing"
        log_event("System", "Execution", "Order status updated to: Processing")
    
    cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (final_status, order_id))
    conn.commit()
    
    return logs
