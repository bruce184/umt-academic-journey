# Define processes: (name, arrival_time, burst_time)
processes = [
    ('P1', 0, 8),
    ('P2', 2, 4),
    ('P3', 3, 9),
    ('P4', 5, 5)
]

# Sort processes by arrival time (though already sorted in this case)
processes.sort(key=lambda x: x[1])

# Initialize variables
current_time = 0
waiting_times = {}
turnaround_times = {}
completion_times = {}

for name, arrival, burst in processes:
    # If process arrives after current time, advance current time
    if arrival > current_time:
        current_time = arrival
    # Calculate completion time
    completion = current_time + burst
    completion_times[name] = completion
    # Turnaround time = completion - arrival
    turnaround = completion - arrival
    turnaround_times[name] = turnaround
    # Waiting time = turnaround - burst
    waiting = turnaround - burst
    waiting_times[name] = waiting
    # Update current time
    current_time = completion

# Calculate averages
total_waiting = sum(waiting_times.values())
total_turnaround = sum(turnaround_times.values())
n = len(processes)
avg_waiting = total_waiting / n
avg_turnaround = total_turnaround / n

# Output results
print("FCFS Scheduling Results:")
print("Process\tArrival\tBurst\tCompletion\tTurnaround\tWaiting")
for name, arrival, burst in processes:
    print(f"{name}\t{arrival}\t{burst}\t{completion_times[name]}\t{turnaround_times[name]}\t{waiting_times[name]}")
print(f"\nAverage Waiting Time: {avg_waiting:.2f}")
print(f"Average Turnaround Time: {avg_turnaround:.2f}")