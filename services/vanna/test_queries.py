"""
Test script to verify all Vanna AI queries work correctly with camelCase columns
"""
import requests
import json
from colorama import init, Fore, Style

init(autoreset=True)

BASE_URL = "http://localhost:8000"

# Test queries
test_queries = [
    "What is the total spend in the last 90 days?",
    "Show me all invoices from October 2025",
    "What is the average invoice amount?",
    "List the top 5 vendors by total spend",
    "How many pending invoices do we have?",
    "Show me invoices due in the next 30 days",
    "What is the total tax amount collected this year?",
    "List all invoices from Microsoft",
]

print(f"\n{Fore.CYAN}{'='*60}")
print(f"🧪 Testing Vanna AI Queries with camelCase Schema")
print(f"{'='*60}{Style.RESET_ALL}\n")

passed = 0
failed = 0

for i, query in enumerate(test_queries, 1):
    print(f"\n{Fore.YELLOW}Test {i}/{len(test_queries)}: {Fore.WHITE}{query}")
    print(f"{Fore.BLUE}{'-'*60}{Style.RESET_ALL}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/query",
            json={"query": query},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Check if SQL was generated
            if "sql" in data:
                print(f"{Fore.GREEN}✅ SQL Generated:")
                print(f"{Fore.WHITE}{data['sql']}{Style.RESET_ALL}")
            
            # Check if results were returned
            if "results" in data and data["results"]:
                print(f"{Fore.GREEN}✅ Results: {len(data['results'])} rows returned")
                print(f"{Fore.WHITE}Sample: {json.dumps(data['results'][0] if data['results'] else {}, indent=2)}{Style.RESET_ALL}")
                passed += 1
            elif "error" in data:
                print(f"{Fore.RED}❌ Error: {data['error']}{Style.RESET_ALL}")
                failed += 1
            else:
                print(f"{Fore.GREEN}✅ Query executed (no results){Style.RESET_ALL}")
                passed += 1
        else:
            print(f"{Fore.RED}❌ HTTP Error: {response.status_code}")
            print(f"{response.text}{Style.RESET_ALL}")
            failed += 1
            
    except Exception as e:
        print(f"{Fore.RED}❌ Exception: {str(e)}{Style.RESET_ALL}")
        failed += 1

# Summary
print(f"\n{Fore.CYAN}{'='*60}")
print(f"📊 Test Summary")
print(f"{'='*60}{Style.RESET_ALL}")
print(f"{Fore.GREEN}✅ Passed: {passed}/{len(test_queries)}")
print(f"{Fore.RED}❌ Failed: {failed}/{len(test_queries)}")

if failed == 0:
    print(f"\n{Fore.GREEN}🎉 All tests passed! Vanna AI is working correctly.{Style.RESET_ALL}")
else:
    print(f"\n{Fore.YELLOW}⚠️  Some tests failed. Check the output above for details.{Style.RESET_ALL}")
