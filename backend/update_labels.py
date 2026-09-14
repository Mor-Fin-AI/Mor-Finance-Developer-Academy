with open('src/services/careers_aggregator.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Just replace line by line
lines = content.split('\n')
new_lines = []
skip = False
for line in lines:
    if "RemoteOK Live Web3 & Crypto API" in line:
        new_lines.append('            "Web3 Career Portal RSS"')
        skip = True
    elif skip and "Web3.Career Live Developer Feed" in line:
        skip = False
    elif skip:
        continue
    elif "100% Live Ingested Developer Feeds" in line:
        new_lines.append('        "source": "100% Live Ingested Developer Feeds (Web3 Career Portal RSS)",')
    else:
        new_lines.append(line)

with open('src/services/careers_aggregator.py', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))
