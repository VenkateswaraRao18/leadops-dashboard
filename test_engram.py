from dotenv import load_dotenv
load_dotenv()
from memory.engram_client import save_interaction, load_context
import time

SEP = '=' * 60

def test_customer(label, email, visits):
    print('\n' + SEP)
    print('TEST: ' + label)
    print(SEP)
    for i, v in enumerate(visits, 1):
        print('  visit %d: score=%s route=%s status=%s' % (i, v['score'], v['route'], v['status']))
        save_interaction(email, v)
        time.sleep(0.5)
    time.sleep(1)
    ctx = load_context(email, query='lead score route status intent company')
    print('--- context ---')
    print(ctx)

# Test 1: cold → warm → hot progression
test_customer(
    'cold to hot progression',
    'v3_progression@test.com',
    [
        {'name': 'Alex Chen', 'company': 'StartupXYZ', 'intent': 'general_inquiry', 'score': 28, 'route': 'cold', 'status': 'declined', 'date': '2026-05-01'},
        {'name': 'Alex Chen', 'company': 'StartupXYZ', 'intent': 'pricing_inquiry', 'score': 55, 'route': 'warm', 'status': 'nurture_sequence', 'date': '2026-05-20'},
        {'name': 'Alex Chen', 'company': 'StartupXYZ', 'intent': 'demo_request', 'score': 93, 'route': 'hot', 'status': 'onboarded', 'date': '2026-06-18'},
    ]
)

# Test 2: company change
test_customer(
    'company change — supersession of semantic fact',
    'v3_company_change@test.com',
    [
        {'name': 'Maya Patel', 'company': 'OldCorp', 'intent': 'demo_request', 'score': 74, 'route': 'hot', 'status': 'onboarded', 'date': '2026-04-01'},
        {'name': 'Maya Patel', 'company': 'NewVentures Inc', 'intent': 'demo_request', 'score': 81, 'route': 'hot', 'status': 'onboarded', 'date': '2026-06-18'},
    ]
)

# Test 3: hot lead goes cold
test_customer(
    'hot lead goes cold — score regression',
    'v3_regression@test.com',
    [
        {'name': 'Tom Walsh', 'company': 'BigCo', 'intent': 'demo_request', 'score': 88, 'route': 'hot', 'status': 'onboarded', 'date': '2026-05-01'},
        {'name': 'Tom Walsh', 'company': 'BigCo', 'intent': 'general_inquiry', 'score': 31, 'route': 'cold', 'status': 'churned', 'date': '2026-06-18'},
    ]
)
