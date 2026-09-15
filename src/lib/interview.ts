import type { MockQuestion, QuestionSource } from '@/lib/types'

export interface InterviewConfig {
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed'
  topic: string
  count: number
  duration: number
}

export const QUESTION_TOPICS = [
  'All Topics',
  'Arrays',
  'Strings',
  'Two Pointers',
  'Hash Map',
  'Sliding Window',
  'Stack',
  'Linked List',
  'Heap',
  'Tree',
  'Graph',
  'Dynamic Programming',
  'Greedy',
  'Binary Search',
  'Backtracking',
  'Math',
]

export const INTERVIEW_DURATIONS = [15, 30, 45, 60, 90]
export const INTERVIEW_COUNTS = [3, 5, 10]

export const QUESTION_SOURCES: QuestionSource[] = ['leetcode', 'codechef', 'geeksforgeeks']

export const SOURCE_LABELS: Record<QuestionSource, string> = {
  leetcode: 'LeetCode',
  codechef: 'CodeChef',
  geeksforgeeks: 'GeeksforGeeks',
}

const Q = (
  id: string,
  title: string,
  topic: string,
  difficulty: MockQuestion['difficulty'],
  description: string,
  hint: string,
  url: string,
  companies: string[],
  source: QuestionSource = 'leetcode'
): MockQuestion => ({ id, title, topic, difficulty, description, hint, url, companies, source })

export const DEFAULT_QUESTION_BANK: MockQuestion[] = [
  // ── Easy ────────────────────────────────────────────────────────
  Q(
    'two-sum',
    'Two Sum',
    'Arrays',
    'Easy',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    'Store each element with its index in a hash map and check for the complement while scanning once.',
    'https://leetcode.com/problems/two-sum/',
    ['Amazon', 'Google', 'Apple', 'Microsoft', 'Adobe', 'Bloomberg']
  ),
  Q(
    'best-time-to-buy-and-sell-stock',
    'Best Time to Buy and Sell Stock',
    'Arrays',
    'Easy',
    'Given stock prices per day, find the maximum profit you can achieve by buying then selling on a later day.',
    'Track the minimum price seen so far and the maximum profit you could lock in at each step.',
    'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    ['Amazon', 'Microsoft', 'Facebook', 'Goldman Sachs', 'Bloomberg', 'Citadel', 'Apple', 'Morgan Stanley']
  ),
  Q(
    'contains-duplicate',
    'Contains Duplicate',
    'Hash Map',
    'Easy',
    'Given an integer array, return true if any value appears at least twice, false otherwise.',
    'A single pass over a Set gives you detection in linear time.',
    'https://leetcode.com/problems/contains-duplicate/',
    ['Amazon', 'Google', 'Apple', 'Microsoft', 'Adobe']
  ),
  Q(
    'valid-anagram',
    'Valid Anagram',
    'Strings',
    'Easy',
    'Given two strings s and t, return true if t is an anagram of s.',
    'Both strings must have identical character frequency counts.',
    'https://leetcode.com/problems/valid-anagram/',
    ['Amazon', 'Google', 'Bloomberg', 'Apple', 'Microsoft']
  ),
  Q(
    'valid-parentheses',
    'Valid Parentheses',
    'Stack',
    'Easy',
    'Given a string containing only brackets, determine if the input string is valid: every opening bracket closes correctly.',
    'Push openers onto a stack; on a closer, verify it matches the top of the stack before popping.',
    'https://leetcode.com/problems/valid-parentheses/',
    ['Amazon', 'Facebook', 'Google', 'Bloomberg', 'Microsoft', 'JPMorgan']
  ),
  Q(
    'merge-two-sorted-lists',
    'Merge Two Sorted Lists',
    'Linked List',
    'Easy',
    'Merge two sorted linked lists into one sorted list and return the new head.',
    'Use a dummy head and advance the smaller node at each step.',
    'https://leetcode.com/problems/merge-two-sorted-lists/',
    ['Amazon', 'Microsoft', 'Adobe', 'Google', 'Apple']
  ),
  Q(
    'reverse-linked-list',
    'Reverse Linked List',
    'Linked List',
    'Easy',
    'Reverse a singly linked list in place and return its new head.',
    'Iterate with prev/curr/next pointers, flipping each nodes next as you go.',
    'https://leetcode.com/problems/reverse-linked-list/',
    ['Amazon', 'Apple', 'Google', 'Microsoft', 'Bloomberg']
  ),
  Q(
    'invert-binary-tree',
    'Invert Binary Tree',
    'Tree',
    'Easy',
    'Given the root of a binary tree, invert the tree — swap the left and right children of every node.',
    'Recursive swap of the two subtrees at every node works in O(n).',
    'https://leetcode.com/problems/invert-binary-tree/',
    ['Amazon', 'Facebook', 'Google', 'Microsoft', 'Apple']
  ),
  Q(
    'maximum-subarray',
    'Maximum Subarray',
    'Dynamic Programming',
    'Medium',
    'Given an integer array, find the contiguous subarray with the largest sum and return that sum.',
    'Kadanes algorithm: keep the best sum ending at the current index, resetting if it ever drops below the current element.',
    'https://leetcode.com/problems/maximum-subarray/',
    ['Amazon', 'Facebook', 'Google', 'Microsoft', 'LinkedIn', 'Bloomberg']
  ),
  Q(
    'climbing-stairs',
    'Climbing Stairs',
    'Dynamic Programming',
    'Easy',
    'You can climb 1 or 2 steps at a time. Count the distinct ways to reach the top of an n-step staircase.',
    'Ways(n) = Ways(n-1) + Ways(n-2); it is simply Fibonacci.',
    'https://leetcode.com/problems/climbing-stairs/',
    ['Amazon', 'Apple', 'Google', 'Adobe', 'Microsoft']
  ),
  Q(
    'valid-palindrome',
    'Valid Palindrome',
    'Strings',
    'Easy',
    'Determine if a string is a palindrome after ignoring non-alphanumeric characters and case.',
    'Use two pointers moving inward, skipping characters that are not letters or digits.',
    'https://leetcode.com/problems/valid-palindrome/',
    ['Amazon', 'Facebook', 'Apple', 'Google', 'Goldman Sachs']
  ),
  Q(
    'binary-search',
    'Binary Search',
    'Binary Search',
    'Easy',
    'Given a sorted array and a target, return the index of the target or -1 if it is not present.',
    'Classic halving search: compare the target to the mid and narrow the range by half.',
    'https://leetcode.com/problems/binary-search/',
    ['Apple', 'Amazon', 'Microsoft', 'Uber', 'Facebook']
  ),
  Q(
    'majority-element',
    'Majority Element',
    'Arrays',
    'Easy',
    'Given an array of size n, find the element that appears more than n/2 times. You may assume it always exists.',
    'Boyer-Moore voting: pair off different elements and the survivor is the majority.',
    'https://leetcode.com/problems/majority-element/',
    ['Amazon', 'Google', 'Apple', 'Microsoft', 'Adobe']
  ),
  Q(
    'linked-list-cycle',
    'Linked List Cycle',
    'Linked List',
    'Easy',
    'Given the head of a linked list, determine if the list has a cycle in it.',
    'Floyd turtle-and-hare: a slow and a fast pointer will eventually collide if a cycle exists.',
    'https://leetcode.com/problems/linked-list-cycle/',
    ['Amazon', 'Apple', 'Google', 'Microsoft', 'Yahoo']
  ),
  Q(
    'max-depth-binary-tree',
    'Maximum Depth of Binary Tree',
    'Tree',
    'Easy',
    'Given the root of a binary tree, return its maximum depth — the number of nodes on the longest root-to-leaf path.',
    'Depth = 1 + max(depth(left), depth(right)); base case is an empty tree at 0.',
    'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    ['Amazon', 'Google', 'Microsoft', 'Facebook', 'Apple']
  ),

  // ── Medium ──────────────────────────────────────────────────────
  Q(
    'product-of-array-except-self',
    'Product of Array Except Self',
    'Arrays',
    'Medium',
    'Given an integer array, return an array such that answer[i] is the product of all numbers except nums[i], without using division.',
    'Compute prefix products left-to-right and suffix products right-to-left, then multiply them per index.',
    'https://leetcode.com/problems/product-of-array-except-self/',
    ['Amazon', 'Apple', 'Google', 'Microsoft', 'Facebook', 'Uber']
  ),
  Q(
    'longest-substring-without-repeating',
    'Longest Substring Without Repeating Characters',
    'Sliding Window',
    'Medium',
    'Given a string, find the length of the longest substring without repeating characters.',
    'Expand the window and shrink it when a duplicate appears, tracking the max length.',
    'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    ['Amazon', 'Google', 'Bloomberg', 'Facebook', 'Microsoft', 'Adobe']
  ),
  Q(
    'group-anagrams',
    'Group Anagrams',
    'Hash Map',
    'Medium',
    'Given an array of strings, group the anagrams together.',
    'Sort each word (or use a character-count key) to group words that are anagrams of one another.',
    'https://leetcode.com/problems/group-anagrams/',
    ['Amazon', 'Google', 'Facebook', 'Microsoft', 'Apple', 'Bloomberg']
  ),
  Q(
    'container-with-most-water',
    'Container With Most Water',
    'Two Pointers',
    'Medium',
    'Given heights of vertical lines, find two lines that together form a container holding the most water.',
    'Start with the widest container and move the shorter pointer inward, tracking the max area.',
    'https://leetcode.com/problems/container-with-most-water/',
    ['Amazon', 'Google', 'Adobe', 'Bloomberg', 'Goldman Sachs']
  ),
  Q(
    '3sum',
    '3Sum',
    'Two Pointers',
    'Medium',
    'Given an integer array, return all unique triplets that sum to zero.',
    'Sort the array, fix one element, then use two pointers on the remaining range; skip duplicates.',
    'https://leetcode.com/problems/3sum/',
    ['Amazon', 'Facebook', 'Apple', 'Google', 'Adobe', 'Yahoo']
  ),
  Q(
    'top-k-frequent-elements',
    'Top K Frequent Elements',
    'Heap',
    'Medium',
    'Given an integer array, return the k most frequent elements in any order.',
    'Count frequencies, then use a min-heap (or bucketing) to keep the k largest counts.',
    'https://leetcode.com/problems/top-k-frequent-elements/',
    ['Amazon', 'Facebook', 'Apple', 'Google', 'LinkedIn', 'Microsoft']
  ),
  Q(
    'generate-parentheses',
    'Generate Parentheses',
    'Backtracking',
    'Medium',
    'Given n pairs of parentheses, generate all combinations of well-formed parentheses.',
    'Backtrack adding an opening bracket when open < n and a closing bracket when close < open.',
    'https://leetcode.com/problems/generate-parentheses/',
    ['Amazon', 'Bloomberg', 'Apple', 'Google', 'Microsoft', 'Facebook']
  ),
  Q(
    'search-in-rotated-sorted-array',
    'Search in Rotated Sorted Array',
    'Binary Search',
    'Medium',
    'Given a rotated sorted array and a target, return the targets index or -1.',
    'Binary search where the pivot side is detected by comparing mid against the left edge.',
    'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    ['Amazon', 'Microsoft', 'Apple', 'Google', 'Bloomberg', 'Adobe']
  ),
  Q(
    'coin-change',
    'Coin Change',
    'Dynamic Programming',
    'Medium',
    'Given coin denominations and an amount, return the fewest coins needed to make that amount.',
    'DP over amounts: dp[a] = min over coins of dp[a - coin] + 1.',
    'https://leetcode.com/problems/coin-change/',
    ['Amazon', 'Goldman Sachs', 'Netflix', 'Bloomberg', 'Facebook', 'Microsoft']
  ),
  Q(
    'longest-palindromic-substring',
    'Longest Palindromic Substring',
    'Dynamic Programming',
    'Medium',
    'Given a string, return the longest palindromic substring.',
    'Expand outward from every center (including between characters) and track the longest match.',
    'https://leetcode.com/problems/longest-palindromic-substring/',
    ['Amazon', 'Microsoft', 'Google', 'Apple', 'Goldman Sachs']
  ),
  Q(
    'number-of-islands',
    'Number of Islands',
    'Graph',
    'Medium',
    'Given a binary grid where 1 represents land, count the number of islands (connected land cells, 4-directional).',
    'Visit every land cell with DFS/BFS and mark the whole island as seen.',
    'https://leetcode.com/problems/number-of-islands/',
    ['Amazon', 'Microsoft', 'Facebook', 'Bloomberg', 'Google', 'Apple']
  ),
  Q(
    'course-schedule',
    'Course Schedule',
    'Graph',
    'Medium',
    'Given the number of courses and prerequisite pairs, can you finish all courses?',
    'A topological order exists if and only if the prerequisite graph has no cycle (Kahn or DFS).',
    'https://leetcode.com/problems/course-schedule/',
    ['Amazon', 'Google', 'Facebook', 'Microsoft', 'Adobe']
  ),
  Q(
    'merge-intervals',
    'Merge Intervals',
    'Arrays',
    'Medium',
    'Given an array of intervals, merge all overlapping intervals and return the result.',
    'Sort by start, then merge consecutive intervals whose start is within the current end.',
    'https://leetcode.com/problems/merge-intervals/',
    ['Google', 'Amazon', 'Facebook', 'Apple', 'Microsoft', 'LinkedIn']
  ),
  Q(
    'binary-tree-level-order-traversal',
    'Binary Tree Level Order Traversal',
    'Tree',
    'Medium',
    'Return the level-order (breadth-first) traversal of a binary tree grouped by level.',
    'Standard queue-based BFS, capturing the size of each level before dequeuing.',
    'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    ['Amazon', 'Apple', 'Microsoft', 'Google', 'Facebook']
  ),
  Q(
    'decode-ways',
    'Decode Ways',
    'Dynamic Programming',
    'Medium',
    'A message is encoded as digits where A=1 ... Z=26. Count how many ways to decode a given digit string.',
    'dp[i] depends on dp[i-1] (single digit) plus dp[i-2] (two-digit code), respecting valid ranges.',
    'https://leetcode.com/problems/decode-ways/',
    ['Amazon', 'Google', 'Facebook', 'Microsoft', 'eBay']
  ),
  Q(
    'task-scheduler',
    'Task Scheduler',
    'Greedy',
    'Medium',
    'Given tasks and a cooldown n, return the minimum number of time units needed to finish all tasks.',
    'The most frequent task dictates the frame size; idle slots are filled by the remaining tasks.',
    'https://leetcode.com/problems/task-scheduler/',
    ['Amazon', 'Facebook', 'Microsoft', 'Google', 'Bloomberg']
  ),

  // ── Hard ────────────────────────────────────────────────────────
  Q(
    'merge-k-sorted-lists',
    'Merge k Sorted Lists',
    'Heap',
    'Hard',
    'Given an array of k sorted linked lists, merge them into one sorted list.',
    'Push every head into a min-heap, repeatedly pop the smallest and push its next node.',
    'https://leetcode.com/problems/merge-k-sorted-lists/',
    ['Amazon', 'Apple', 'Facebook', 'Google', 'Microsoft']
  ),
  Q(
    'trapping-rain-water',
    'Trapping Rain Water',
    'Two Pointers',
    'Hard',
    'Given elevation heights, compute how much rainwater can be trapped after it rains.',
    'The water above each column is limited by the lower of the highest walls on its left and right; use two pointers.',
    'https://leetcode.com/problems/trapping-rain-water/',
    ['Amazon', 'Google', 'Facebook', 'Apple', 'Bloomberg']
  ),
  Q(
    'sliding-window-maximum',
    'Sliding Window Maximum',
    'Sliding Window',
    'Hard',
    'Given an array and a window size k, return the maximum value in every window.',
    'Maintain a monotonic deque of indices whose values are decreasing.',
    'https://leetcode.com/problems/sliding-window-maximum/',
    ['Amazon', 'Google', 'Adobe', 'Microsoft', 'Facebook', 'Uber']
  ),
  Q(
    'find-median-from-data-stream',
    'Find Median from Data Stream',
    'Heap',
    'Hard',
    'Design a class that supports adding integers and returning the median so far.',
    'Keep a max-heap for the lower half and a min-heap for the upper half, rebalancing after each add.',
    'https://leetcode.com/problems/find-median-from-data-stream/',
    ['Google', 'Amazon', 'Facebook', 'Bloomberg', 'Microsoft']
  ),
  Q(
    'edit-distance',
    'Edit Distance',
    'Dynamic Programming',
    'Hard',
    'Given two strings, return the minimum number of insert, delete, and replace operations to convert one into the other.',
    'Classic DP table: if characters match carry the diagonal; otherwise take 1 + min of the three operations.',
    'https://leetcode.com/problems/edit-distance/',
    ['Amazon', 'Google', 'Microsoft', 'LinkedIn', 'Goldman Sachs']
  ),
  Q(
    'lru-cache',
    'LRU Cache',
    'Hash Map',
    'Hard',
    'Design a least-recently-used cache with O(1) get and put operations.',
    'Hash map for O(1) lookup plus a doubly-linked list to maintain recency order.',
    'https://leetcode.com/problems/lru-cache/',
    ['Amazon', 'Facebook', 'Google', 'Bloomberg', 'Microsoft', 'Apple']
  ),
  Q(
    'word-ladder',
    'Word Ladder',
    'Graph',
    'Hard',
    'Given a start word, an end word, and a word list, return the length of the shortest transformation sequence changing one letter at a time.',
    'BFS on the graph of words (or pattern-masked neighbors); the first time you reach the end is the shortest path.',
    'https://leetcode.com/problems/word-ladder/',
    ['Amazon', 'Google', 'Facebook', 'Microsoft', 'Cisco']
  ),
  Q(
    'reverse-nodes-in-k-group',
    'Reverse Nodes in k-Group',
    'Linked List',
    'Hard',
    'Given a linked list, reverse the nodes of the list k at a time and return the modified list.',
    'Detect a full k-group, reverse it iteratively, relink, and recurse into the next group.',
    'https://leetcode.com/problems/reverse-nodes-in-k-group/',
    ['Amazon', 'Microsoft', 'Google', 'Yahoo', 'Facebook']
  ),

  // ── CodeChef ─────────────────────────────────────────────────────
  Q(
    'tlg',
    'The Lead Game',
    'Arrays',
    'Easy',
    'Score two players round by round and report who held the maximum cumulative lead, and how large it was.',
    'Track cumulative totals and update the lead whenever a new maximum difference appears.',
    'https://www.codechef.com/problems/TLG',
    ['Amazon', 'TCS', 'Infosys'],
    'codechef'
  ),
  Q(
    'intest',
    'Enormous Input Test',
    'Math',
    'Easy',
    'Read a list of integers and count how many of them are divisible by k, fast enough for a million inputs.',
    'Use a fast scanner and a modulo check per line; buffered I/O is the key.',
    'https://www.codechef.com/problems/INTEST',
    ['Accenture', 'TCS', 'Wipro'],
    'codechef'
  ),
  Q(
    'conflip',
    'Coin Flip',
    'Math',
    'Easy',
    'After a given number of rounds of flipping coin piles, report the count of heads or tails for a chosen pile type.',
    'Work out the parity of total flips with the observed side instead of simulating every flip.',
    'https://www.codechef.com/problems/CONFLIP',
    ['Amazon', 'Infosys'],
    'codechef'
  ),
  Q(
    'carvans',
    'Car Vans',
    'Greedy',
    'Easy',
    'Cars drive along a single-lane road at their max speeds; a slower car ahead caps every car behind it. Count how many drive at their max speed.',
    'Scan left to right remembering the slowest speed seen so far; each car must beat it.',
    'https://www.codechef.com/problems/CARVANS',
    ['Amazon', 'Google', 'Flipkart'],
    'codechef'
  ),
  Q(
    'tachstck',
    'Chopsticks',
    'Two Pointers',
    'Easy',
    'Pair chopsticks whose lengths differ by at most D so that no stick is reused; maximize the number of pairs.',
    'Sort lengths, then greedily pair adjacent sticks whose difference is within D.',
    'https://www.codechef.com/problems/TACHSTCK',
    ['Amazon', 'Goldman Sachs'],
    'codechef'
  ),
  Q(
    'permut2',
    'Ambiguous Permutations',
    'Arrays',
    'Easy',
    'Given a permutation, check whether it is ambiguous: a permutation equal to its inverse.',
    'Build the inverse array and test whether perm[i] === inv[i] for every position.',
    'https://www.codechef.com/problems/PERMUT2',
    ['Microsoft', 'Infosys'],
    'codechef'
  ),
  Q(
    'mnmx',
    'Minimum Maximum',
    'Greedy',
    'Easy',
    'Repeatedly pick two adjacent numbers and replace them with their minimum until one remains; find the best possible result.',
    'The optimal final value is the minimum element of the whole array — prove it with a greedy merge.',
    'https://www.codechef.com/problems/MNMX',
    ['Amazon', 'Wipro'],
    'codechef'
  ),
  Q(
    'chefarrp',
    'Chef and Subarrays',
    'Arrays',
    'Medium',
    'Count subarrays whose sum equals their product.',
    'For positive integers the product grows fast — enumerate subarrays whose product equals the sum.',
    'https://www.codechef.com/problems/CHEFARRP',
    ['Amazon'],
    'codechef'
  ),
  Q(
    'marcha1',
    'Pay Up',
    'Dynamic Programming',
    'Medium',
    'Can a subset of note denominations sum to exactly the amount the mafia demands?',
    'Classic subset-sum DP over the denomination range.',
    'https://www.codechef.com/problems/MARCHA1',
    ['Amazon', 'Microsoft', 'PayPal'],
    'codechef'
  ),
  Q(
    'notatri',
    'Not a Triangle',
    'Two Pointers',
    'Medium',
    'Given stick lengths, count triples that cannot form a triangle.',
    'Sort and, for each pair, binary-search the first length that breaks the triangle inequality.',
    'https://www.codechef.com/problems/NOTATRI',
    ['Google', 'Amazon', 'Goldman Sachs'],
    'codechef'
  ),

  // ── GeeksforGeeks ───────────────────────────────────────────────
  Q(
    'sort-0s-1s-2s',
    'Sort an array of 0s, 1s and 2s',
    'Arrays',
    'Easy',
    'Sort an array containing only 0, 1 and 2 in linear time without a counting technique.',
    'Use the Dutch National Flag algorithm with three pointers.',
    'https://www.geeksforgeeks.org/sort-an-array-of-0s-1s-and-2s/',
    ['Amazon', 'Microsoft', 'Morgan Stanley', 'Samsung', 'Adobe'],
    'geeksforgeeks'
  ),
  Q(
    'missing-number-in-array',
    'Missing number in array',
    'Arrays',
    'Easy',
    'Given an array of n-1 numbers taken from 1..n, find the missing number.',
    'The missing value is n(n+1)/2 minus the sum of the array.',
    'https://www.geeksforgeeks.org/find-the-missing-number/',
    ['Amazon', 'Microsoft', 'Samsung', 'Visa', 'Accenture'],
    'geeksforgeeks'
  ),
  Q(
    'subarray-with-given-sum',
    'Subarray with given sum',
    'Arrays',
    'Easy',
    'Find the contiguous subarray whose sum exactly equals a target S.',
    'Sliding window over non-negative numbers: extend, and shrink while the sum exceeds S.',
    'https://www.geeksforgeeks.org/find-subarray-with-given-sum/',
    ['Amazon', 'Google', 'Facebook', 'Visa', 'Accenture'],
    'geeksforgeeks'
  ),
  Q(
    'parenthesis-checker',
    'Parenthesis Checker',
    'Stack',
    'Easy',
    'Check whether an expression of {}, [], and () is balanced.',
    'Push openers; on a closer, verify it matches the top, else invalid.',
    'https://www.geeksforgeeks.org/check-for-balanced-parentheses-in-an-expression/',
    ['Amazon', 'Microsoft', 'Google', 'Adobe'],
    'geeksforgeeks'
  ),
  Q(
    'reverse-words',
    'Reverse words in a given string',
    'Strings',
    'Easy',
    'Reverse the order of words in a sentence, preserving the words themselves.',
    'Split on spaces and rejoin in reverse order, or two-pointer swap in place.',
    'https://www.geeksforgeeks.org/reverse-words-in-a-given-string/',
    ['Amazon', 'Microsoft', 'Cisco', 'Accenture'],
    'geeksforgeeks'
  ),
  Q(
    'first-repeated-character',
    'Find first repeated character',
    'Hash Map',
    'Easy',
    'Return the first character in a string that appears more than once.',
    'Record first index per character; the second occurrence with the smallest sum reports first.',
    'https://www.geeksforgeeks.org/find-first-repeated-character-in-a-string/',
    ['Amazon', 'Adobe', 'Oracle'],
    'geeksforgeeks'
  ),
  Q(
    'kth-smallest-element',
    'Kth smallest element',
    'Heap',
    'Medium',
    'Find the k-th smallest element in an unsorted array.',
    'Use a max-heap of size k, or quickselect for O(n) average.',
    'https://www.geeksforgeeks.org/kth-smallest-element-in-an-array/',
    ['Amazon', 'Microsoft', 'Google', 'Cisco', 'Accenture'],
    'geeksforgeeks'
  ),
  Q(
    'first-non-repeating-stream',
    'First non-repeating character in a stream',
    'Hash Map',
    'Medium',
    'After each character of a stream arrives, report the first non-repeating character so far (or #).',
    'Keep a frequency map and a queue; pop chars that have become repeats.',
    'https://www.geeksforgeeks.org/queue-based-approach-for-first-non-repeating-character-in-a-stream/',
    ['Amazon', 'Microsoft', 'Adobe'],
    'geeksforgeeks'
  ),
  Q(
    'stock-buy-sell',
    'Stock buy and sell',
    'Greedy',
    'Medium',
    'Find the maximum profit from multiple buy-sell transactions on a price series.',
    'Sum every upward segment: profit = Σ max(0, price[i] - price[i-1]).',
    'https://www.geeksforgeeks.org/stock-buy-sell/',
    ['Amazon', 'D-E-Shaw', 'Facebook', 'Goldman Sachs', 'Intuit', 'Microsoft'],
    'geeksforgeeks'
  ),
  Q(
    'rat-in-a-maze',
    'Rat in a Maze',
    'Backtracking',
    'Medium',
    'Find all paths a rat can take from the top-left to the bottom-right, moving only down or right on open cells.',
    'Backtrack cell by cell, marking visited and pruning dead ends.',
    'https://www.geeksforgeeks.org/rat-in-a-maze-problem-when-movement-in-all-possible-directions-is-allowed/',
    ['Amazon', 'Microsoft', 'Samsung'],
    'geeksforgeeks'
  ),
  Q(
    'word-wrap',
    'Word Wrap',
    'Dynamic Programming',
    'Hard',
    'Break a line of words into lines of width at most kW minimizing the sum of squared unused spaces.',
    'dp[i] = best cost for words i..n; try every valid break point k ≥ i.',
    'https://www.geeksforgeeks.org/word-wrap-problem-dp-19/',
    ['Amazon', 'Google'],
    'geeksforgeeks'
  ),
  Q(
    'n-queen-problem',
    'N-Queen Problem',
    'Backtracking',
    'Hard',
    'Place N queens on an N×N board so that no two attack each other.',
    'Backtrack row by row, checking column and both diagonals per placement.',
    'https://www.geeksforgeeks.org/n-queen-problem-backtracking-3/',
    ['Amazon', 'Microsoft', 'Google', 'Accenture', 'Visa'],
    'geeksforgeeks'
  ),
]

// This week's date range (Sunday → Saturday) used when posting an interview
// as a Planner goal.
export function questionGoalRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay())
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { start: fmt(start), end: fmt(end) }
}

export function buildInterviewQuestions(
  bank: MockQuestion[],
  config: Pick<InterviewConfig, 'difficulty' | 'topic' | 'count'>,
  source?: QuestionSource | null
): MockQuestion[] {
  const difficulty = config.difficulty
  const topic = config.topic

  let base = bank
  if (source) {
    base = base.filter((q) => q.source === source)
  }

  const byDifficulty = base.filter((q) => difficulty === 'Mixed' || q.difficulty === difficulty)
  const byTopic = base.filter((q) => topic === 'All Topics' || q.topic === topic)

  // Prefer questions that match both difficulty and topic, then fill the
  // session with difficulty-matches, then topic-matches, then the rest.
  const pool: MockQuestion[] = []
  const priority = [
    byDifficulty.filter((q) => topic === 'All Topics' || q.topic === topic),
    byDifficulty,
    byTopic,
    base,
  ]
  for (const list of priority) {
    for (const q of list) {
      if (!pool.some((p) => p.id === q.id)) pool.push(q)
    }
  }

  // Shuffle for variety across runs
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  return pool.slice(0, config.count)
}