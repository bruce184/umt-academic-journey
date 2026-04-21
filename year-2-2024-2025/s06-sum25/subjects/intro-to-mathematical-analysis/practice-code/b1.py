import math 

def find_N_opt_iter(epsilon):
    if epsilon <= 0:
        raise ValueError("Epsilon phải lớn hơn 0")
    n = 1
    while 1 / (2 ** n) >= epsilon:
        n += 1
    return n

def find_N_opt_formula(epsilon):
    if epsilon <= 0:
        raise ValueError("Epsilon phải lớn hơn 0")
    # math.log2: log cơ số 2, math.ceil lấy phần nguyên trên
    return math.ceil(math.log2(1.0 / epsilon))

if __name__ == "__main__":
    eps = float(input("Nhập ε (>0): "))
    print("Kết quả lặp:      N =", find_N_opt_iter(eps))
    print("Kết quả công thức: N =", find_N_opt_formula(eps))
