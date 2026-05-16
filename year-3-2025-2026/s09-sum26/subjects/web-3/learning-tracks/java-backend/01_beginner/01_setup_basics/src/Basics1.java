import java.util.Scanner;

public class Basics1 {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        String name;
        int age; 
        double gpa; 

        System.out.print("Enter your name: ");
        name = scanner.nextLine();

        System.out.print("Enter your age:");
        age = scanner.nextInt();

        System.out.print("Enter your gpa:");
        gpa = scanner.nextDouble();

        System.out.println("\n--- Student Info ---");
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Gpa: " + gpa);

        scanner.close();
    }
}