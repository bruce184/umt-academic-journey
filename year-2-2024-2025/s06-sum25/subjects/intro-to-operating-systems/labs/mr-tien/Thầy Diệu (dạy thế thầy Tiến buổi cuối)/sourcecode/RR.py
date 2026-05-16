# Define processes: (name, arrival_time, burst_time)
processes = [
    ('P1', 0, 8),
    ('P2', 2, 4),
    ('P3', 3, 9),
    ('P4', 5, 5)
]

# Time quantum
quantum = 4

# Initialize variables
current_time = 0
queue = []
waiting_times = {p[0]: 0 for p in processes}
turnaround_times = {}
completion_times = {}
remaining_burst = {p[0]: p[2] for p in processes}
arrivals = {p[0]: p[1] for p in processes}

# Sort by arrival for initial queue
processes.sort(key=lambda x: x[1])

i = 0  # Index for adding processes to queue
while True:
    # Add arrived processes to queue
    while i < len(processes) and processes[i][1] <= current_time:
        queue.append(processes[i][0])
        i += 1
    
    if not queue:
        if i < len(processes):
            # Advance to next arrival
            current_time = processes[i][1]
            continue
        else:
            break  # All done
    
    # Get next process
    name = queue.pop(0)
    
    # Execute for min(quantum, remaining_burst)
    exec_time = min(quantum, remaining_burst[name])
    current_time += exec_time
    remaining_burst[name] -= exec_time
    
    # Update waiting times for others in queue
    for other in queue:
        waiting_times[other] += exec_time
    
    # If process finished
    if remaining_burst[name] == 0:
        completion = current_time
        completion_times[name] = completion
        turnaround = completion - arrivals[name]
        turnaround_times[name] = turnaround
        # Waiting = turnaround - original burst
        waiting_times[name] = turnaround - (remaining_burst[name] + processes[[p[0] for p in processes].index(name)][2])
    else:
        # Re-add to queue
        queue.append(name)
    
    # Add any new arrivals during execution
    while i < len(processes) and processes[i][1] <= current_time:
        queue.append(processes[i][0])
        i += 1

# Correct waiting times (already updated in simulation)
# Calculate averages
total_waiting = sum(waiting_times.values())
total_turnaround = sum(turnaround_times.values())
n = len(processes)
avg_waiting = total_waiting / n
avg_turnaround = total_turnaround / n

# Output results
print("Round-Robin Scheduling Results (Quantum=4):")
print("Process\tArrival\tBurst\tCompletion\tTurnaround\tWaiting")
for name, arrival, burst in processes:
    print(f"{name}\t{arrival}\t{burst}\t{completion_times[name]}\t{turnaround_times[name]}\t{waiting_times[name]}")
print(f"\nAverage Waiting Time: {avg_waiting:.2f}")
print(f"Average Turnaround Time: {avg_turnaround:.2f}")