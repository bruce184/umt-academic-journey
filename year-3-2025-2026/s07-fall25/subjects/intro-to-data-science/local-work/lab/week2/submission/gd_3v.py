import numpy as np
from math import sqrt

x1 = np.array([1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0], dtype=float)  # hours
x2 = np.array([1,   1,   2,   2,   3,   2,   3,   4,   4,   5], dtype=float)    # practice tests
y  = np.array([95, 68, 72, 75, 79, 81, 85, 89, 92, 95], dtype=float)            # score

n = len(y)

num_iterations = 1000
learning_rates_to_try = [0.0001, 0.001, 0.01] 

def h(i, theta0, theta1, theta2):
    return theta0 + theta1 * x1[i] + theta2 * x2[i]

def cost(theta0, theta1, theta2):
    # J(θ) = (1/2n) * sum((hθ(x) - y)^2)
    total = 0.0
    for i in range(n):
        err = h(i, theta0, theta1, theta2) - y[i]
        total += err * err
    return total / (2 * n)

def compute_gradients(theta0, theta1, theta2):
    # ∂J/∂θ0 = (1/n) * sum(err)
    g0 = 0.0
    g1 = 0.0
    g2 = 0.0
    for i in range(n):
        err = h(i, theta0, theta1, theta2) - y[i]
        g0 += err
        g1 += err * x1[i]
        g2 += err * x2[i]
    return g0 / n, g1 / n, g2 / n

# Iterate through different learning rates
for learning_rate in learning_rates_to_try:
    theta0 = 0.0
    theta1 = 0.0
    theta2 = 0.0

    print(f"\n--- Training with learning rate: {learning_rate} ---")

    for it in range(1, num_iterations + 1):
        g0, g1, g2 = compute_gradients(theta0, theta1, theta2)
        theta0 -= learning_rate * g0
        theta1 -= learning_rate * g1
        theta2 -= learning_rate * g2

    print("\nRESULTS")
    print(f"Learning Rate = {learning_rate}")
    print(f"θ0 (bias)   = {theta0:.6f}")
    print(f"θ1 (x1 w.)  = {theta1:.6f}")
    print(f"θ2 (x2 w.)  = {theta2:.6f}")
    print(f"Final cost  = {cost(theta0, theta1, theta2):.8f}")