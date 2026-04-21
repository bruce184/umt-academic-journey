import math

def find_N_opt(a, b, c, d, eps):
    L = a / c
    n = 1
    while abs((a*n + b)/(c*n + d) - L) >= eps:
        n += 1
    return n

# Main
a, b, c, d = map(float, input("Nhập a b c d (c≠0): ").split())
eps = float(input("Nhập epsilon (>0): "))
N = find_N_opt(a, b, c, d, eps)
print(f"N nhỏ nhất sao cho |(a·n+b)/(c·n+d) - a/c| < ε là: {N}")
