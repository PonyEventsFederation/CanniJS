#!/usr/bin/python
import sys,json

def data_in():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])

def data_out(data):
    out = json.dumps(data)
    print(out)

def main():
    data = data_in()
    data_out(data)

if __name__ == '__main__':
    main()