#include <iostream>
#include <vector>
#include <unordered_set>
#include <string>

using namespace std;

// A production rule: IF antecedents THEN consequent
struct Rule {
    vector<string> antecedents;
    string consequent;
};

// Forward chaining: iteratively infer new facts until no more can be added
unordered_set<string> forwardChaining(
    const vector<Rule>& rules,
    unordered_set<string> facts
) {
    bool added = true;
    while (added) {
        added = false;
        for (const auto& rule : rules) {
            bool allTrue = true;
            for (const auto& cond : rule.antecedents) {
                if (facts.find(cond) == facts.end()) {
                    allTrue = false;
                    break;
                }
            }
            if (allTrue && facts.find(rule.consequent) == facts.end()) {
                facts.insert(rule.consequent);
                added = true;
            }
        }
    }
    return facts;
}

int main() {
    // Initialize the set of rules
    vector<Rule> rules = {
        {{"rain"},            "wet_ground"},
        {{"wet_ground"},      "slippery"},
        {{"sprinkler_on"},    "wet_ground"},
        {{"rain", "traffic"}, "accident"}
    };

    // Initialize the initial facts
    unordered_set<string> facts = {"rain", "traffic"};

    // Perform forward chaining
    auto inferredFacts = forwardChaining(rules, facts);

    // Print all inferred facts
    cout << "Inferred facts:\n";
    for (const auto& fact : inferredFacts) {
        cout << "- " << fact << "\n";
    }

    return 0;
}
