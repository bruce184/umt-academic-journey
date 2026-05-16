# Define processes: (name, arrival_time, burst_time)
processes = [
    ('P1', 0, 8),
    ('P2', 2, 4),
    ('P3', 3, 9),
    ('P4', 5, 5)
]

# Initialize variables
current_time = 0
waiting_times = {}
turnaround_times = {}
completion_times = {}
remaining_processes = processes.copy()

while remaining_processes:
    # Find ready processes (arrived by current_time)
    ready = [p for p in remaining_processes if p[1] <= current_time]
    if not ready:
        # No ready processes, advance time to next arrival
        next_arrival = min(p[1] for p in remaining_processes)
        current_time = next_arrival
        continue
    # Select the one with shortest burst time
    ready.sort(key=lambda x: x[2])
    name, arrival, burst = ready[0]
    # Execute the process
    completion = current_time + burst
    completion_times[name] = completion
    turnaround = completion - arrival
    turnaround_times[name] = turnaround
    waiting = turnaround - burst
    waiting_times[name] = waiting
    current_time = completion
    # Remove from remaining
    remaining_processes.remove((name, arrival, burst))

# Calculate averages
total_waiting = sum(waiting_times.values())
total_turnaround = sum(turnaround_times.values())
n = len(processes)
avg_waiting = total_waiting / n
avg_turnaround = total_turnaround / n

# Output results (sorted by original order for display)
print("SJF (Non-Preemptive) Scheduling Results:")
print("Process\tArrival\tBurst\tCompletion\tTurnaround\tWaiting")
for name, arrival, burst in processes:
    print(f"{name}\t{arrival}\t{burst}\t{completion_times[name]}\t{turnaround_times[name]}\t{waiting_times[name]}")
print(f"\nAverage Waiting Time: {avg_waiting:.2f}")
print(f"Average Turnaround Time: {avg_turnaround:.2f}")