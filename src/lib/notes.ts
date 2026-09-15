export interface WebNote {
  title: string
  url: string
  source: string
}

export interface RefinedSection {
  heading: string
  points: string[]
}

export interface RefinedNote {
  tagline: string
  sections: RefinedSection[]
  iitSources: WebNote[]
}

interface WebNoteEntry {
  keywords: string[]
  notes: WebNote[]
  refined?: RefinedNote
}

// Stable IIT / NIT reference sources (NPTEL courses authored by IITs).
const IIT_DSA = {
  title: 'Programming, Data Structures and Algorithms Using Python — NPTEL (IIT Madras)',
  url: 'https://nptel.ac.in/courses/106106145',
  source: 'NPTEL (IIT)',
}
const IIT_PROG = {
  title: 'Problem Solving Through Programming in C — NPTEL (IIT Kharagpur)',
  url: 'https://nptel.ac.in/courses/106104128',
  source: 'NPTEL (IIT)',
}

const nptelRef = (ref: WebNote): WebNote[] => [ref, IIT_DSA]

// Curated, stable links to high-quality ready-made notes per topic.
// Real-world URLs are used so learners can open verified material.
const WEB_NOTE_ENTRIES: WebNoteEntry[] = [
  {
    keywords: ['array'],
    notes: [
      { title: 'Introduction to Arrays — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/introduction-to-arrays-data-structure-and-algorithm-tutorials/', source: 'GeeksforGeeks' },
      { title: 'Arrays in Java — Programiz', url: 'https://www.programiz.com/java-programming/arrays', source: 'Programiz' },
      { title: 'Array Data Structure — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/array-data-structure/', source: 'GeeksforGeeks' },
    ],
    refined: {
      tagline:
        'An array stores elements of the same type in contiguous memory and gives O(1) random access by index. It is the building block for almost every other data structure.',
      sections: [
        {
          heading: 'Definition and properties',
          points: [
            'Contiguous block of memory; every element occupies the same size, so index i sits at base + i × size.',
            'Zero-indexed in C/C++/Java/Python list indexing; length is fixed at declaration in C/C++/Java (dynamic in Python/JS/ArrayList).',
            'Cache-friendly and fast because of spatial locality.',
          ],
        },
        {
          heading: 'Operations and time complexity',
          points: [
            'Access/update by index — O(1).',
            'Search (linear) — O(n); binary search on sorted array — O(log n).',
            'Insert/delete at end — O(1); at middle/start — O(n) due to shifting.',
            'Traversal — O(n).',
          ],
        },
        {
          heading: 'Common patterns',
          points: [
            'Two-pointer technique for pairs, partitioning and palindrome checks.',
            'Sliding window for substring / subarray problems.',
            'Prefix sum for range-sum queries in O(1) after O(n) preprocessing.',
            'Kadane\u2019s algorithm for maximum subarray sum — keep running sum, reset to 0 when negative.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Off-by-one errors in loops and indexing.',
            'Assuming the array is sorted when it is not (or vice-versa).',
            'Modifying array while iterating over it.',
            'Ignoring large n — nested loops become O(n²) too fast.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_PROG),
    },
  },
  {
    keywords: ['string', 'strings'],
    notes: [
      { title: 'String Data Structure — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/string-data-structure/', source: 'GeeksforGeeks' },
      { title: 'String in Python — W3Schools', url: 'https://www.w3schools.com/python/python_strings.asp', source: 'W3Schools' },
    ],
    refined: {
      tagline:
        'Strings are ordered sequences of characters. Treat them as immutable in most languages and watch out for operations that secretly copy them.',
      sections: [
        {
          heading: 'Core concepts',
          points: [
            'Stored as contiguous bytes (C-style char arrays or length-prefixed).',
            'In Python/Java/JS strings are immutable — concatenation creates a new object.',
            'Comparisons: lexical (dictionary order) via built-in <, >, or strcmp.',
          ],
        },
        {
          heading: 'Key techniques',
          points: [
            'Hashing strings with rolling hash (Rabin-Karp) for substring search in O(n+m).',
            'Palindrome checks with two pointers from both ends.',
            'Anagram detection by frequency count (array of 26 for lowercase).',
            'Building frequency maps with a hash table instead of nested loops.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Mutating a string in place — use a character array where needed.',
            'Concatenation in a loop is O(n²) with immutable strings; use join/append.',
            'Confusing empty string with null / empty substring boundaries.',
            'Unicode/encoding bugs when slicing by bytes instead of characters.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_PROG),
    },
  },
  {
    keywords: ['link', 'linked list', 'linked-list'],
    notes: [
      { title: 'What is Linked List — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/what-is-linked-list/', source: 'GeeksforGeeks' },
      { title: 'Linked List — Programiz', url: 'https://www.programiz.com/dsa/linked-list', source: 'Programiz' },
    ],
    refined: {
      tagline:
        'A linked list is a linear structure of nodes connected by pointers. It trades O(1) middle insertion/deletion for O(n) random access.',
      sections: [
        {
          heading: 'Structure and types',
          points: [
            'Singly linked: node = data + next pointer; doubly linked: adds prev; circular: last node points to head.',
            'Head pointer marks the first node; empty list is a null head.',
            'No indices — you must traverse to reach position k (O(k)).',
          ],
        },
        {
          heading: 'Time complexity',
          points: [
            'Access/search — O(n).',
            'Insert/delete after a known node — O(1); at a given index — O(n) to reach it.',
            'Reverse — O(n) time, O(1) space iteratively.',
          ],
        },
        {
          heading: 'Classic problems',
          points: [
            'Reverse a list (iterative with prev/curr/next pointers; recursive).',
            'Detect cycle with Floyd\u2019s slow-fast pointer; find cycle start node.',
            'Find middle / k-th from end using slow-fast pointers.',
            'Merge two sorted lists; detect intersection point.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Null-pointer dereference on .next of the tail.',
            'Losing the head/first node by overwriting the local pointer.',
            'Not updating prev in doubly linked insert/delete.',
            'Infinite loop when the list is circular.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_PROG),
    },
  },
  {
    keywords: ['stack'],
    notes: [
      { title: 'Stack Data Structure — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/introduction-to-stack-data-structure-and-algorithm-tutorials/', source: 'GeeksforGeeks' },
      { title: 'Stack — Programiz', url: 'https://www.programiz.com/dsa/stack', source: 'Programiz' },
    ],
    refined: {
      tagline:
        'A stack is a LIFO (Last In, First Out) structure supporting push, pop and top. It models \u201crewind\u201d-style problems beautifully.',
      sections: [
        {
          heading: 'Operations',
          points: [
            'push(x) — O(1); pop() — O(1); top()/peek — O(1); isEmpty — O(1).',
            'Implemented with arrays (fixed size → overflow) or linked lists.',
            'LIFO ordering: the most recently inserted element is removed first.',
          ],
        },
        {
          heading: 'Applications',
          points: [
            'Balanced parentheses / bracket matching.',
            'Undo (Ctrl+Z), call stack, expression evaluation (postfix/infix).',
            'DFS, iterative tree traversals, monotonic stack problems (next greater element).',
            'Backtracking state saving.',
          ],
        },
        {
          heading: 'Monotonic stacks',
          points: [
            'Keep a strictly increasing/decreasing stack to track \u201cnext greater/smaller\u201d in O(n).',
            'Pop while the invariant breaks, pushing each element exactly once.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Underflow — popping an empty stack.',
            'Forgetting that stack peek vs pop are different operations.',
            'Using O(n) search where O(1) top access suffices.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['queue', 'deque'],
    notes: [
      { title: 'Queue Data Structure — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/introduction-to-queue-data-structure-and-algorithm-tutorials/', source: 'GeeksforGeeks' },
      { title: 'Queue — Programiz', url: 'https://www.programiz.com/dsa/queue', source: 'Programiz' },
    ],
    refined: {
      tagline:
        'A queue is FIFO (First In, First Out): enqueue at the rear, dequeue from the front. It is the workhorse behind BFS and scheduling.',
      sections: [
        {
          heading: 'Variants',
          points: [
            'Simple queue — FIFO with enqueue/dequeue in O(1).',
            'Circular queue — reuses array space by wrapping indices.',
            'Deque — insert/delete at both ends.',
            'Priority queue — always serves the highest/lowest priority element (heap).',
          ],
        },
        {
          heading: 'Applications',
          points: [
            'BFS on graphs/trees uses a queue.',
            'CPU/job scheduling, printer and buffer queues.',
            'Level-order tree traversal, sliding window maximum (deque).',
            'Breadth-first shortest path on unweighted graphs.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Confusing stack (LIFO) vs queue (FIFO) in traversal problems.',
            'Front vs rear indexing errors in circular queues.',
            'Using BFS everywhere when DFS visits order is what you need.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['hash', 'hashing', 'hash table', 'hashmap', 'hash-map'],
    notes: [
      { title: 'What is Hashing — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/what-is-hashing/', source: 'GeeksforGeeks' },
      { title: 'Hash Table — Programiz', url: 'https://www.programiz.com/dsa/hash-table', source: 'Programiz' },
    ],
    refined: {
      tagline:
        'Hash tables map keys to values via a hash function, giving expected O(1) insert, lookup and delete — the single most useful trick for contest problems.',
      sections: [
        {
          heading: 'How it works',
          points: [
            'hash(key) → index into a bucket array; collisions handled below.',
            'Load factor = number of keys / bucket count; keep below ~0.7, then resize/rehash.',
            'Hashing spreads keys uniformly so average bucket occupancy stays near 1.',
          ],
        },
        {
          heading: 'Collision resolution',
          points: [
            'Chaining — each bucket is a linked list/tree; worst case degrades to O(n).',
            'Open addressing — linear/quadratic probing, double hashing; stores keys directly in buckets.',
            'Modern maps (Python dict, C++ unordered_map) auto-resize and handle worst cases.',
          ],
        },
        {
          heading: 'Common uses',
          points: [
            'Frequency counting (anagrams, duplicates) in O(n).',
            'Lookup / memoization tables, two-sum style problems.',
            'De-duplication and membership tests.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Worst-case O(n) if hash function is bad or input forces collisions (hash collisions attacks).',
            'Hash of mutable keys changes location — keys should be immutable.',
            'Equality vs hash consistency — equal objects must have equal hashes.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['tree', 'trees'],
    notes: [
      { title: 'Introduction to Tree — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/introduction-to-tree-data-structure-and-algorithm-tutorials/', source: 'GeeksforGeeks' },
      { title: 'Tree — Programiz', url: 'https://www.programiz.com/dsa/trees', source: 'Programiz' },
    ],
    refined: {
      tagline:
        'A tree is an acyclic connected graph with exactly one path between any two nodes. Tree problems are almost all about definitions and recursion.',
      sections: [
        {
          heading: 'Terminology',
          points: [
            'Root (top), children, parent, leaves (no children), subtree.',
            'Height = longest path from root to a leaf (edges); depth = distance from root.',
            'A tree with n nodes always has exactly n−1 edges.',
          ],
        },
        {
          heading: 'Types',
          points: [
            'Binary tree — each node has ≤ 2 children.',
            'Binary search tree — left < node < right.',
            'Balanced trees — height kept O(log n) (AVL, Red-Black).',
            'Heap — complete binary tree with heap property.',
            'Trie — node per character for efficient strings.',
          ],
        },
        {
          heading: 'Key ideas',
          points: [
            'Recursion is the natural way to walk a tree (left/right subtrees).',
            'Count properties: sizes, depths, heights are combined bottom-up.',
            'Traversals: DFS pre/in/post-order and BFS level-order.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Forgetting base case for null/empty tree.',
            'Confusing height of a single node (0 edges) with number of nodes (1).',
            'Not distinguishing tree vs graph — trees have no cycles.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['binary tree', 'binary-tree'],
    notes: [
      { title: 'Binary Tree — Programiz', url: 'https://www.programiz.com/dsa/binary-tree', source: 'Programiz' },
      { title: 'Binary Tree Data Structure — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/introduction-to-binary-tree-data-structure-and-algorithm-tutorials/', source: 'GeeksforGeeks' },
    ],
    refined: {
      tagline:
        'A binary tree restricts every node to at most two children (left, right). Full, complete and perfect binary trees have precise definitions vital for heaps and arrays.',
      sections: [
        {
          heading: 'Classifications',
          points: [
            'Full / proper: every node has 0 or 2 children.',
            'Complete: all levels filled except possibly the last, filled left to right.',
            'Perfect: every level completely filled — exactly (2^h+1)−1 nodes for height h.',
            'Skewed: every node has one child → behaves like a linked list, height O(n).',
          ],
        },
        {
          heading: 'Storages',
          points: [
            'Pointer-based: left/right references per node.',
            'Array-based for complete trees: node at i → left child 2i+1, right 2i+2, parent ⌊(i−1)/2⌋ — used by heaps.',
          ],
        },
        {
          heading: 'Traversals',
          points: [
            'Pre-order (root, left, right) — copies/serialization.',
            'In-order (left, root, right) — sorted order for BST.',
            'Post-order (left, right, root) — deletion, expression evaluation.',
            'Level-order (BFS) — shortest paths, width.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Counting nodes (2^h−1 for perfect) vs edges.',
            'Null-child handling in recursion.',
            'Rebuilding tree from traversal arrays requires in-order + one of pre/post.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['binary search tree', 'bst'],
    notes: [
      { title: 'Binary Search Tree — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/binary-search-tree-data-structure/', source: 'GeeksforGeeks' },
      { title: 'Binary Search Tree — Programiz', url: 'https://www.programiz.com/dsa/binary-search-tree', source: 'Programiz' },
    ],
    refined: {
      tagline:
        'A BST keeps every left subtree < node < right subtree, so search, insert and delete average O(log n) — but can degenerate to O(n) when unbalanced.',
      sections: [
        {
          heading: 'Invariant and operations',
          points: [
            'For every node: all keys in left subtree < node.key < all keys in right subtree.',
            'Search: compare and descend left/right — O(height).',
            'Insert: descend to a leaf and attach — O(height).',
            'Delete: leaf (remove), one child (link over), two children (replace with in-order successor/predecessor).',
          ],
        },
        {
          heading: 'Why height matters',
          points: [
            'Balanced BSTs (AVL, Red-Black, Splay) keep height O(log n) with rotations.',
            'Inserting sorted data into an unbalanced BST creates a skewed list → O(n) operations.',
          ],
        },
        {
          heading: 'Nice properties',
          points: [
            'In-order traversal yields keys in ascending order.',
            'Successor = leftmost of right subtree; predecessor = rightmost of left subtree.',
            'Efficient range queries and \u201ck-th smallest\u201d with subtree sizes.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Forgetting to rebalance after many inserts.',
            'Delete-by-copy confusion when the node has two children.',
            'Using BST where hash table (O(1)) or sorted array (cache-friendly) fits better.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['heap', 'priority queue', 'priority-queue'],
    notes: [
      { title: 'Heap Data Structure — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/introduction-to-heap-data-structure-and-algorithm-tutorials/', source: 'GeeksforGeeks' },
      { title: 'Heap Data Structure — Programiz', url: 'https://www.programiz.com/dsa/heap-data-structure', source: 'Programiz' },
    ],
    refined: {
      tagline:
        'A heap is a complete binary tree where parents satisfy an ordering property. It is the standard implementation of a priority queue.',
      sections: [
        {
          heading: 'Definition',
          points: [
            'Min-heap: parent ≤ children (root = minimum). Max-heap: parent ≥ children (root = maximum).',
            'Complete binary tree → stored compactly in an array.',
            'Parent i → children 2i+1, 2i+2; child i → parent ⌊(i−1)/2⌋.',
          ],
        },
        {
          heading: 'Operations (all in a min-heap)',
          points: [
            'peek() — O(1); insert — O(log n); extract-min — O(log n).',
            'insert: add at end, bubble up. extract-min: swap root with last, bubble down (heapify).',
            'heapify on one node — O(log n); build heap from array — O(n).',
          ],
        },
        {
          heading: 'Applications',
          points: [
            'Priority scheduling, Dijkstra\u2019s and Prim\u2019s algorithms.',
            'Top-K elements with a min-heap of size K — O(n log K).',
            'Heap sort — O(n log n), in-place, not stable.',
            'Median maintenance with two heaps (max + min).',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Only min or max is visible — no random access to middle.',
            'Inefficient decrease-key (O(log n) after locating element; custom handles needed in Dijkstra).',
            'Forgetting heap is not sorted globally.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['graph', 'graphs'],
    notes: [
      { title: 'Graph Data Structure — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/', source: 'GeeksforGeeks' },
      { title: 'Graph — Programiz', url: 'https://www.programiz.com/dsa/graph', source: 'Programiz' },
      { title: 'Graph Traversals (BFS & DFS) — Programiz', url: 'https://www.programiz.com/dsa/graph-dfs', source: 'Programiz' },
    ],
    refined: {
      tagline:
        'A graph is a set of vertices connected by edges, possibly directed, weighted or cyclic. Choosing the right representation and traversal is 80% of the problem.',
      sections: [
        {
          heading: 'Representations',
          points: [
            'Adjacency list: vertices → neighbors. Space O(V+E); the default choice.',
            'Adjacency matrix: V×V boolean/weight matrix. Space O(V²); O(1) edge check, good for dense small graphs.',
            'Edge list: array of (u, v, w) — used for MST (Kruskal) and sorting edges.',
          ],
        },
        {
          heading: 'Traversals',
          points: [
            'BFS (queue) — shortest path on unweighted graphs, level order, bipartite check.',
            'DFS (stack/recursion) — connectivity, cycle detection, topological sort, strongly connected components.',
            'Both visit each edge once → O(V+E).',
          ],
        },
        {
          heading: 'Key algorithms',
          points: [
            'Dijkstra — non-negative weights, O((V+E) log V) with a heap.',
            'Bellman-Ford / Floyd-Warshall — negative weights and all-pairs.',
            'Kruskal / Prim — minimum spanning tree.',
            'Union-Find (DSU) — dynamic connectivity, cycle detection in undirected graphs.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Forgetting visited set — infinite loops on cycles.',
            'Stack overflow from deep recursion in DFS on large graphs.',
            '0-indexed vs 1-indexed vertices; directed vs undirected edge handling.',
            'Applying Dijkstra to graphs with negative edges.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['recursion', 'recursive'],
    notes: [
      { title: 'Recursion in C — Programiz', url: 'https://www.programiz.com/c-programming/c-recursion', source: 'Programiz' },
      { title: 'Introduction to Recursion — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/introduction-to-recursion-data-structure-and-algorithm-tutorials/', source: 'GeeksforGeeks' },
    ],
    refined: {
      tagline:
        'Recursion solves a problem by solving smaller versions of itself. Every recursive function needs a base case and a recurrence that steps toward it.',
      sections: [
        {
          heading: 'Anatomy',
          points: [
            'Base case: smallest input solved directly (stops recursion).',
            'Recursive step: reduce the problem and call itself with smaller input.',
            'Each call pushes a frame on the call stack — depth is bounded by memory.',
          ],
        },
        {
          heading: 'Thinking in recurrences',
          points: [
            'f(n) = f(n−1) + f(n−2) is Fibonacci; O(2^n) naive, O(n) memoized.',
            'Factorial: f(n) = n × f(n−1).',
            'Tree/linked-list problems are naturally recursive.',
            'Divide and conquer recursion halves input: T(n) = 2T(n/2) + O(n) → O(n log n).',
          ],
        },
        {
          heading: 'Recursion vs iteration',
          points: [
            'Same complexity; recursion is clearer for branching problems, iteration avoids stack overhead.',
            'Tail recursion can be optimized to loops by compilers.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Missing base case → stack overflow.',
            'Forgetting the return value up the chain.',
            'Recomputing the same sub-problems (use memoization).',
            'Very deep recursion crashes on recursion-limit; convert to iterative where needed.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['sort', 'sorting'],
    notes: [
      { title: 'Sorting Algorithms — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/sorting-algorithms/', source: 'GeeksforGeeks' },
      { title: 'Quick Sort — Programiz', url: 'https://www.programiz.com/dsa/quick-sort', source: 'Programiz' },
      { title: 'Merge Sort — Programiz', url: 'https://www.programiz.com/dsa/merge-sort', source: 'Programiz' },
    ],
    refined: {
      tagline:
        'Sorting orders data so that later queries and algorithms get easier. Knowing the complexity and stability of each algorithm tells you when to use it.',
      sections: [
        {
          heading: 'Comparison-based algorithms',
          points: [
            'Bubble / Insertion / Selection — O(n²); insertion is best for nearly-sorted arrays.',
            'Merge sort — O(n log n), stable, O(n) extra space.',
            'Quick sort — O(n log n) average, O(n²) worst (bad pivots), in-place, not stable.',
            'Heap sort — O(n log n), in-place, not stable.',
          ],
        },
        {
          heading: 'Not comparison-based (integer keys)',
          points: [
            'Counting sort — O(n+k) when key range k is small.',
            'Radix sort — O(d(n+k)) digit by digit.',
            'Bucket sort — distribute into buckets then sort each.',
          ],
        },
        {
          heading: 'Important properties',
          points: [
            'Stable sort keeps equal elements in original order (useful with comparator by secondary key).',
            'Adaptive sorts like insertion take O(n) on almost-sorted input.',
            'Lower bound for any comparison sort is Ω(n log n).',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Using O(n²) sorts at scale when the library sort is already optimal.',
            'Unstable sort breaking secondary ordering.',
            'Sorting by a computed transform repeatedly (precompute the key).',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['search', 'searching'],
    notes: [
      { title: 'Searching Algorithms — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/searching-algorithms/', source: 'GeeksforGeeks' },
      { title: 'Binary Search — Programiz', url: 'https://www.programiz.com/dsa/binary-search', source: 'Programiz' },
    ],
    refined: {
      tagline:
        'Searching pinpoints an element or a boundary. Linear search is O(n); binary search on sorted data is O(log n) and has an elegant recursive form.',
      sections: [
        {
          heading: 'Linear search',
          points: [
            'Scan every element until found — O(n) worst, O(1) best.',
            'Only option on unsorted data (without preprocessing).',
            'Fine for small arrays or once-off lookups.',
          ],
        },
        {
          heading: 'Binary search',
          points: [
            'Requires sorted data; repeatedly halves the range — O(log n).',
            'Classic: while low ≤ high, mid = low + (high − low)/2 to avoid overflow.',
            'Variants: first/last occurrence (lower_bound / upper_bound), smallest element ≥ target.',
            'Works for \u201csearch on answer\u201d problems: predicate that is monotonic.',
          ],
        },
        {
          heading: 'Ternary / others',
          points: [
            'Ternary search on unimodal functions (find peak) — O(log n).',
            'Hashing gives O(1) membership but no ordering; binary search preserves order.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Infinite loop when low/high boundaries are wrong (use mid±1 carefully).',
            'Overflow in mid = (low+high)/2 for large values.',
            'Searching beyond array bounds when target missing.',
            'Binary search on unsorted data is incorrect.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['dynamic programming', 'dp'],
    notes: [
      { title: 'Dynamic Programming — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/dynamic-programming/', source: 'GeeksforGeeks' },
      { title: 'Dynamic Programming — Programiz', url: 'https://www.programiz.com/dsa/dynamic-programming', source: 'Programiz' },
    ],
    refined: {
      tagline:
        'DP = recursion + memoization. Problems with overlapping subproblems and optimal substructure get solved once per state instead of recomputing.',
      sections: [
        {
          heading: 'Two core properties',
          points: [
            'Optimal substructure — optimal answer built from optimal answers of sub-problems.',
            'Overlapping subproblems — the same sub-problem appears many times; store results.',
          ],
        },
        {
          heading: 'Two ways to write it',
          points: [
            'Top-down: recursive function + memo table keyed by state.',
            'Bottom-up: fill a table iteratively in dependency order (preferred — no recursion overhead).',
            'State definition is the hard part: state = (index, remaining capacity, ...), value = best result.',
          ],
        },
        {
          heading: 'Classic problems to know',
          points: [
            'Fibonacci, knapsack (0/1, unbounded), Longest Common Subsequence, Longest Increasing Subsequence.',
            'Edit distance, coin change, rod cutting, matrix chain.',
            'Grid paths, partition problems, subset sum.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Defining a state that loses information needed for the recurrence.',
            'Forgetting the base case / boundary indices in bottom-up.',
            'Wrong transition order — fill smaller subproblems first.',
            'O(n) states but O(n²) transition smell; optimize with greedy/preprocessing where valid.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['greedy'],
    notes: [
      { title: 'Greedy Algorithms — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/greedy-algorithms/', source: 'GeeksforGeeks' },
    ],
    refined: {
      tagline:
        'Greedy algorithms make the locally best choice in hope of a global optimum. They are fast (often O(n log n)) but need a correctness proof.',
      sections: [
        {
          heading: 'The greedy idea',
          points: [
            'At every step pick the option that looks best right now, without backtracking.',
            'Works only when the choice has the matroid/greedy-choice property (local optimum ⇒ global optimum).',
            'Prove correctness with exchange arguments: \u201cany optimal solution can be modified to match the greedy choice without worsening it.\u201d',
          ],
        },
        {
          heading: 'Classic greedy problems',
          points: [
            'Activity selection / interval scheduling — sort by end time, take non-overlapping.',
            'Huffman coding — merge two smallest frequencies.',
            'Fractional knapsack — always take the highest value/weight ratio.',
            'Minimum spanning tree (Prim/Kruskal), coin change when denominations are canonical.',
            'Minimum number of platforms / meeting rooms.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Applying greedy to problems with no proof that local choices are safe.',
            '0/1 knapsack is NOT solvable greedily by density — DP needed.',
            'Tie-breaking that breaks optimality.',
            'Sorting the wrong key (e.g., by duration instead of end time).',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['backtrack'],
    notes: [
      { title: 'Backtracking Algorithms — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/backtracking-algorithms/', source: 'GeeksforGeeks' },
      { title: 'Backtracking Algorithm — Programiz', url: 'https://www.programiz.com/dsa/backtracking-algorithm', source: 'Programiz' },
    ],
    refined: {
      tagline:
        'Backtracking is DFS over a decision tree with pruning: build candidates step by step and abandon a branch when it cannot lead to a solution.',
      sections: [
        {
          heading: 'The pattern',
          points: [
            'State = partial solution. At each step enumerate choices, pick one, recurse, then undo (backtrack).',
            'Base case: a complete candidate that satisfies constraints.',
            'Prune early: skip branches that violate constraints — this is what makes it fast.',
          ],
        },
        {
          heading: 'Classic problems',
          points: [
            'Generate all subsets / permutations / combinations.',
            'N-Queens, Sudoku solver, graph coloring, Hamiltonian path.',
            'Word search on a grid, letter combinations of a phone number.',
            'Sudoku / crosswords / regex matching with * and ?.',
          ],
        },
        {
          heading: 'Complexity',
          points: [
            'Naively exponential — subsets 2^n, permutations n!.',
            'Pruning and constraint propagation often make practical cases much faster.',
            'State space can be reduced with memoization when subproblems overlap.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Forgetting to undo the last change before trying the next branch.',
            'Not skipping duplicates after sorting (e.g., subsets II).',
            'Deep recursion copying entire state arrays each call — pass by reference and copy only on commit.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['complexity', 'big o', 'big-o', 'asymptotic', 'analysis of algorithm'],
    notes: [
      { title: 'Analysis of Algorithms — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/analysis-of-algorithms-set-1-asymptotic-analysis/', source: 'GeeksforGeeks' },
      { title: 'Big-O Notation — Khan Academy', url: 'https://www.khanacademy.org/computing/computer-science/algorithms/asymptotic-notation/a/big-o-notation', source: 'Khan Academy' },
    ],
    refined: {
      tagline:
        'Asymptotic analysis describes how time/space grow with input size n. Big-O is the upper bound that dominates interviews and design.',
      sections: [
        {
          heading: 'Growth order (slow → fast)',
          points: [
            'O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n) < O(n!).',
            'O(log n): binary search. O(n log n): merge/quick/heap sort.',
            'For n = 10⁶: O(n) ≈ fine, O(n log n) fine, O(n²) too slow in most languages.',
          ],
        },
        {
          heading: 'How to derive',
          points: [
            'Drop constants and lower-order terms: 3n² + 5n + 2 → O(n²).',
            'Loops multiply; nested independent loops multiply; loop + inner helper depends on helper.',
            'Amortized analysis: a sequence of operations that occasionally cost high averages out (e.g., array resizing → O(1) amortized).',
          ],
        },
        {
          heading: 'Master theorem (divide & conquer)',
          points: [
            'T(n) = aT(n/b) + f(n): compare f(n) with n^(log_b a) to classify O(n^c), O(n^c log n) or O(f(n)).',
          ],
        },
        {
          heading: 'Space complexity',
          points: [
            'Count auxiliary memory: recursion stack, tables, extra arrays.',
            'Trade time for space (hash map caching) is the most common optimization.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Confusing worst-case with expected/average case.',
            'Checking only loops and missing O(n) calls hidden in library ops (sort, substring in a loop).',
            'Big-O describes growth, not absolute speed — a fast O(n²) can beat a slow O(n log n) for small n.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['bit', 'bitwise', 'bit manipulation'],
    notes: [
      { title: 'Bitwise Operators — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/bitwise-operators-in-c-cpp/', source: 'GeeksforGeeks' },
      { title: 'Bit Tricks for Competitive Programming — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/bit-tricks-competitive-programming/', source: 'GeeksforGeeks' },
    ],
    refined: {
      tagline:
        'Bit manipulation operates on binary digits and is extremely fast. XOR tricks and bit masks are favourite interview and contest patterns.',
      sections: [
        {
          heading: 'Core operators',
          points: [
            '& (AND), | (OR), ^ (XOR), ~ (NOT), << (left shift = ×2), >> (right shift = ÷2).',
            'Check k-th bit: (x >> k) & 1. Set bit: x | (1 << k).',
            'Clear bit: x & ~(1 << k). Toggle: x ^ (1 << k).',
          ],
        },
        {
          heading: 'Powerful identities',
          points: [
            'x ^ 0 = x, x ^ x = 0 → XOR finds the number that appears once among pairs.',
            'x & (x−1) clears the lowest set bit; count set bits = popcount loop, or use builtin in C++ (__builtin_popcount) / Python (bit_count()).',
            'Lowest set bit: x & (−x) = x & ~(x−1).',
            'x & 1 tests even/odd; (x << 1) doubles, (x >> 1) halves.',
          ],
        },
        {
          heading: 'Applications',
          points: [
            'Subset enumeration with masks 0..2^n−1.',
            'Fast integer hashing and set flags (bitmask state in DP).',
            'Finding missing/duplicate numbers with XOR.',
            'Checking power of two: x > 0 && (x & (x−1)) === 0.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Signed shift on negative numbers — Python/Java semantics differ from C++.',
            'Operator precedence — always parenthesize bitwise expressions.',
            'Shifting by ≥ bit-width is undefined behavior in C/C++.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_PROG),
    },
  },
  {
    keywords: ['math', 'mathematics', 'number theory'],
    notes: [
      { title: 'Mathematical Algorithms — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/mathematical-algorithms/', source: 'GeeksforGeeks' },
    ],
    refined: {
      tagline:
        'Number theory gives fast tools for divisibility, primes and modular arithmetic — the hidden engines behind many contest and interview problems.',
      sections: [
        {
          heading: 'GCD / LCM',
          points: [
            'gcd(a,b) in O(log min(a,b)) via Euclid: gcd(b, a % b).',
            'lcm(a,b) = a / gcd(a,b) · b — divide first to avoid overflow.',
            'gcd(a, 0) = a; gcd is associative → gcd over a whole array by reduction.',
          ],
        },
        {
          heading: 'Primes',
          points: [
            'Sieve of Eratosthenes marks composites in O(n log log n) — get all primes up to n.',
            'Check primality with trial division up to √n in O(√n).',
            'Prime factorization by dividing repeatedly — collect exponent counts.',
          ],
        },
        {
          heading: 'Modular arithmetic',
          points: [
            '(a+b) mod m = ((a mod m) + (b mod m)) mod m; same for subtraction and multiplication.',
            'Modular exponentiation via repeated squaring — O(log power).',
            'Modular inverse (a^{-1} mod m) exists when gcd(a,m)=1; use Fermat\u2019s for prime m, extended Euclid otherwise.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Integer overflow in lcm/combinatorics — use 64-bit or modular arithmetic.',
            'Forgetting mod on multiplication of two large numbers.',
            'Assuming numbers fit in int for factorial / combinatorics.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['object-oriented', 'oop', 'oops'],
    notes: [
      { title: 'Object Oriented Programming — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/object-oriented-programming-in-cpp/', source: 'GeeksforGeeks' },
      { title: 'Java OOP — W3Schools', url: 'https://www.w3schools.com/java/java_oop.asp', source: 'W3Schools' },
    ],
    refined: {
      tagline:
        'OOP organizes code around objects — data + behavior. Master the four pillars and know how each maps in Java/C++/Python.',
      sections: [
        {
          heading: 'The four pillars',
          points: [
            'Encapsulation — hide data with private fields and expose via methods; protects invariants.',
            'Abstraction — expose interface, hide implementation (abstract classes, interfaces).',
            'Inheritance — subclass reuses and extends parent behavior (is-a relationship).',
            'Polymorphism — many forms: compile-time (overloading, templates) and runtime (overriding, virtual dispatch).',
          ],
        },
        {
          heading: 'Class essentials',
          points: [
            'Class vs object: class is a blueprint, object is an instance.',
            'Constructors initialize state; destructors / finalizers clean up.',
            'Access modifiers: private, protected, public (and package-private in Java).',
          ],
        },
        {
          heading: 'Design principles',
          points: [
            'Prefer composition over inheritance.',
            'Program to interfaces, not implementations.',
            'SOLID — single responsibility, open-closed, Liskov substitution, interface segregation, dependency inversion.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Deep inheritance hierarchies that are hard to maintain.',
            'Exposing mutable internal state.',
            'Confusing overloading (same name, different params) with overriding (same signature in subclass).',
            'Shallow vs deep copy semantics for objects.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_PROG),
    },
  },
  {
    keywords: ['python'],
    notes: [
      { title: 'Python Tutorial — W3Schools', url: 'https://www.w3schools.com/python/', source: 'W3Schools' },
      { title: 'Python Programming Language — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/python-programming-language/', source: 'GeeksforGeeks' },
    ],
    refined: {
      tagline:
        'Python is dynamically typed and batteries-included. It reads almost like pseudocode, which makes it ideal for quick implementations — but watch out for performance.',
      sections: [
        {
          heading: 'Fundamentals',
          points: [
            'Dynamic typing: variables hold objects of any type; type hints are optional documentation.',
            'Indentation defines blocks. Lists, tuples, dicts, sets are built-in workhorses.',
            'Functions are first-class; lambda + comprehensions compress loops.',
          ],
        },
        {
          heading: 'Data structures',
          points: [
            'list: order + duplicates, O(1) append/index; set & dict: hash-based O(1) average.',
            'tuple: immutable (fixed) — usable as dict keys.',
            'collections: deque for O(1) both ends, Counter, defaultdict, heapq for heap.',
          ],
        },
        {
          heading: 'Patterns that matter',
          points: [
            'List/dict/set comprehensions — readable, fast.',
            'Generator expressions for lazy iteration.',
            'Exceptions with try/except for control flow where appropriate.',
            'Understand scope (LEGB) and mutable default argument pitfall.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Mutable default arguments are shared across calls.',
            'Integer overflow does not exist, but large ints are slow; ~10⁸ ops is a rough per-second ceiling.',
            'Slicing creates copies — O(k) memory per slice.',
            'Nested loops over big inputs need algorithmic fixes, not micro-optimization.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['java'],
    notes: [
      { title: 'Java Tutorial — W3Schools', url: 'https://www.w3schools.com/java/', source: 'W3Schools' },
      { title: 'Java — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/java/', source: 'GeeksforGeeks' },
    ],
    refined: {
      tagline:
        'Java compiles to bytecode run on the JVM with automatic garbage collection and a rich standard library — the classic enterprise and interview language.',
      sections: [
        {
          heading: 'JVM & memory',
          points: [
            'Source → bytecode (.class) → JVM → machine code (JIT).',
            'Heap holds objects; stack holds references/primitives; GC reclaims unreachable objects.',
            '\u201cEverything is pass-by-value\u201d — references are copied, so mutation inside methods affects callers.',
          ],
        },
        {
          heading: 'Core syntax areas',
          points: [
            'Primitives (int, long, double, char, boolean) vs wrapper classes (Integer, Double ...).',
            'Interfaces, abstract classes, records, enums.',
            'Generics give compile-time type safety: List<String>, Map<K,V>.',
            'Exception hierarchy: checked vs unchecked (RuntimeException).',
          ],
        },
        {
          heading: 'Collections (java.util)',
          points: [
            'ArrayList — O(1) index/append; LinkedList — O(1) ends.',
            'HashMap / HashSet — O(1) average; TreeMap / TreeSet — O(log n) sorted.',
            'PriorityQueue (min-heap by default), Deque/ArrayDeque, Streams for functional pipelines.',
          ],
        },
        {
          heading: 'Concurrency basics',
          points: [
            'Threads via Runnable/Thread/ExecutorService; volatile and synchronized for visibility.',
            'Concurrent collections (ConcurrentHashMap) avoid locking pitfalls.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            '== on objects compares references — use .equals(); autoboxing surprises (Integer cache).',
            'Ignoring null and NPE handling in input-heavy code.',
            'String concatenation in loops — use StringBuilder.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_PROG),
    },
  },
  {
    keywords: ['c++', 'cpp', 'cplusplus'],
    notes: [
      { title: 'C++ Tutorial — W3Schools', url: 'https://www.w3schools.com/cpp/', source: 'W3Schools' },
      { title: 'C++ Programming Language — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/c-plus-plus/', source: 'GeeksforGeeks' },
    ],
    refined: {
      tagline:
        'C++ gives manual memory control, zero-cost abstractions and the STL — the fast language of choice for competitive programming and systems software.',
      sections: [
        {
          heading: 'Basics that matter',
          points: [
            'Pointers hold addresses; references are aliases. & address-of, * dereference.',
            'Value vs reference vs pointer passing — mutation semantics change accordingly.',
            'new/delete manual memory; prefer smart pointers (unique_ptr, shared_ptr) in modern code.',
          ],
        },
        {
          heading: 'STL containers',
          points: [
            'vector — dynamic array, O(1) push_back/index; string — mutable char buffer.',
            'map (ordered, O(log n)), unordered_map (hash, O(1) average), set/multiset.',
            'stack, queue, priority_queue, deque; sort/stable_sort in <algorithm>.',
          ],
        },
        {
          heading: 'Objects & RAII',
          points: [
            'Constructor/destructor; copies: copy ctor, copy assignment, move ctor (C++11).',
            'RAII — resource acquisition is initialization: destructors release memory/file/thread.',
            'Templates & STL algorithms allow generic, allocation-friendly code.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Out-of-bounds access is UB (no automatic check on raw arrays).',
            'Iterators invalidated by vector resizing during iteration.',
            'Slicing when copying a derived object through base type.',
            'Signed/unsigned comparisons and integer overflow traps; use long long for large sums.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_PROG),
    },
  },
  {
    keywords: ['javascript', 'js', 'react', 'node'],
    notes: [
      { title: 'JavaScript Tutorial — W3Schools', url: 'https://www.w3schools.com/js/default.asp', source: 'W3Schools' },
    ],
    refined: {
      tagline:
        'JavaScript is event-driven and single-threaded with asynchronous callbacks. Understanding the event loop, closures and this-context unlocks the language.',
      sections: [
        {
          heading: 'Language core',
          points: [
            'Primitives & objects; typeof quirks; == vs === (=== preferred).',
            'Closures: inner functions capture outer scope — powering factories and React hooks.',
            'this depends on how a function is called: method, constructor, arrow (lexical), bind/call/apply.',
            'Hoisting: declarations are moved up; let/const are block-scoped and TDZ-protected.',
          ],
        },
        {
          heading: 'Async model',
          points: [
            'Single thread + event loop: call stack, task queue (macrotasks), microtask queue.',
            'Promise: .then/.catch; async/await is syntactic sugar over promises.',
            'setTimeout is a macrotask — microtasks (promises) run before the next macrotask.',
          ],
        },
        {
          heading: 'React basics',
          points: [
            'Components return UI from props/state; state changes trigger re-render.',
            'Hooks: useState, useEffect, useContext, useMemo, useCallback.',
            'Props flow down, events flow up; keep components pure.',
            'Keys in lists must be stable and unique.',
          ],
        },
        {
          heading: 'Node.js essentials',
          points: [
            'require/import, module system; npm install manages dependencies.',
            'Non-blocking I/O → fast servers; never block the event loop.',
            'Express for routing; process.env for configuration.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Losing this in callbacks — use arrow functions.',
            'Shared mutable state and stale closures in async code.',
            'Forgetting cleanup in useEffect → memory leaks.',
            'Comparing NaN, or objects with ===.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['sql', 'database', 'db', 'mysql'],
    notes: [
      { title: 'SQL Tutorial — W3Schools', url: 'https://www.w3schools.com/sql/sql_intro.asp', source: 'W3Schools' },
      { title: 'DBMS — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/dbms/', source: 'GeeksforGeeks' },
    ],
    refined: {
      tagline:
        'Databases store data with guarantees. Learn tables/relationships, SQL, normalization, transactions and indexing to answer both query and design questions.',
      sections: [
        {
          heading: 'Relational model',
          points: [
            'Tables (relations), rows (tuples), columns (attributes). Keys: primary, candidate, super, foreign.',
            '1-Many and Many-Many relationships via junction tables.',
            'Normalization removes redundancy: 1NF atomic columns, 2NF remove partial dependency, 3NF remove transitive dependency.',
          ],
        },
        {
          heading: 'SQL essentials',
          points: [
            'SELECT/WHERE/GROUP BY/HAVING/ORDER BY/LIMIT — HAVING filters groups, WHERE filters rows.',
            'JOINs: INNER, LEFT, RIGHT, FULL, CROSS; self-join for hierarchies.',
            'Aggregates: COUNT, SUM, AVG, MIN, MAX; DISTINCT; subqueries and CTEs.',
            'DML vs DDL: INSERT/UPDATE/DELETE vs CREATE/ALTER/DROP.',
          ],
        },
        {
          heading: 'Transactions & ACID',
          points: [
            'Atomicity, Consistency, Isolation, Durability.',
            'Isolation levels: READ UNCOMMITTED → SERIALIZABLE trade performance vs correctness.',
            'Problems: dirty reads, lost updates, phantom reads; solved with locking/MVCC.',
          ],
        },
        {
          heading: 'Indexing',
          points: [
            'B+Tree index speeds equality and range lookups at the cost of write overhead.',
            'Choosing the right index order matters for multi-column queries.',
            'At most one column uses an index range efficiently in a query — analyze EXPLAIN.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'SELECT * transferring huge columns; missing index on WHERE/JOIN keys.',
            'Off-by-one NULL behavior — NULL is not equal or not-equal to anything.',
            'N+1 query problem in ORMs — batch with JOIN/IN.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['divide and conquer', 'divide-conquer'],
    notes: [
      { title: 'Divide and Conquer — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/divide-and-conquer-algorithm-introduction/', source: 'GeeksforGeeks' },
      { title: 'Divide and Conquer — Khan Academy', url: 'https://www.khanacademy.org/computing/computer-science/algorithms/merge-sort/a/divide-and-conquer-algorithms', source: 'Khan Academy' },
    ],
    refined: {
      tagline:
        'Divide and conquer splits a problem into independent sub-parts, solves them recursively and combines results. It is why sorting and search are logarithmic.',
      sections: [
        {
          heading: 'The three steps',
          points: [
            'Divide — break input into smaller independent parts.',
            'Conquer — solve each part recursively (base case: trivial input).',
            'Combine — merge the sub-solutions into the answer.',
          ],
        },
        {
          heading: 'Classic examples',
          points: [
            'Merge sort: divide halves, sort each, merge two sorted arrays — O(n log n).',
            'Quick sort / quick select: partition around a pivot — O(n log n) / O(n) average.',
            'Binary search: halve the range — O(log n).',
            'Closest pair of points, Karatsuba multiplication, Strassen matrix multiply.',
          ],
        },
        {
          heading: 'Master theorem',
          points: [
            'T(n) = aT(n/b) + f(n). If f(n) is smaller than n^(log_b a): O(n^(log_b a)); equal: add log n; larger: O(f(n)).',
            'Merge sort: a=2, b=2, f=n → O(n log n).',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Using D&C when sub-problems overlap heavily — that is DP territory.',
            'Forgetting to handle odd-sized splits or base cases.',
            'Naively re-sorting in combine step destroys the O(n log n) bound.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['sliding window', 'two pointer', 'two-pointer'],
    notes: [
      { title: 'Sliding Window Technique — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/window-sliding-technique/', source: 'GeeksforGeeks' },
      { title: 'Two Pointers Technique — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/two-pointers-technique/', source: 'GeeksforGeeks' },
    ],
    refined: {
      tagline:
        'Sliding window and two-pointer turn many O(n²) subarray problems into single O(n) passes using a moving range and smart pointer movement.',
      sections: [
        {
          heading: 'Two pointers',
          points: [
            'Pair-sum approach: with a sorted array, move the low pointer up or high pointer down based on the sum.',
            'Classics: two-sum in sorted array, removing duplicates, merging sorted arrays, palindrome check.',
            'Each pointer moves at most n times → O(n) total.',
          ],
        },
        {
          heading: 'Sliding window (fixed-size)',
          points: [
            'Average of k consecutive elements, sliding window maximum/minimum.',
            'Maintain window sum/counts and slide by removing the outgoing element and adding the incoming one.',
          ],
        },
        {
          heading: 'Sliding window (variable-size)',
          points: [
            'Grow the window while the constraint holds; shrink when it breaks.',
            'Longest substring without repeating characters: shrink until hash set unique.',
            'Minimum window substring: count frequencies, expand right, contract left while valid.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Forgetting to update the window count when sliding the left edge.',
            'Using a fixed window where variable is required (and vice-versa).',
            'Sorting the array when the original order matters.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['operating system', 'os '],
    notes: [
      { title: 'Operating System Tutorial — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/operating-systems/', source: 'GeeksforGeeks' },
    ],
    refined: {
      tagline:
        'The OS manages processes, CPU, memory and I/O. Core interview topics: process/thread, scheduling, synchronization, deadlock and memory management.',
      sections: [
        {
          heading: 'Processes vs threads',
          points: [
            'Process = isolated program instance with own address space; threads share memory within a process.',
            'Context switch between processes is expensive; thread switch is cheaper.',
            'IPC: pipes, message queues, shared memory, sockets.',
          ],
        },
        {
          heading: 'CPU scheduling',
          points: [
            'FCFS (first come), SJF (shortest job — optimal avg wait but needs future knowledge), Round Robin (time-slicing, fair).',
            'Priority scheduling can starve; aging solves starvation.',
            'Know how to compute turnaround time and waiting time for a schedule.',
          ],
        },
        {
          heading: 'Synchronization',
          points: [
            'Race conditions arise from concurrent access to shared data.',
            'Tools: mutex (locks critical section), semaphore (counting resource access), condition variables.',
            'Classic problems: producer-consumer, readers-writers, dining philosophers.',
            'Atomic operations / lock-free primitives avoid holding locks.',
          ],
        },
        {
          heading: 'Deadlock',
          points: [
            'Four conditions: mutual exclusion, hold & wait, no preemption, circular wait.',
            'Prevention/avoidance (Banker\u2019s algorithm) / detection & recovery / ignore (Ostrich).',
          ],
        },
        {
          heading: 'Memory management',
          points: [
            'Paging with page tables and TLB; segmentation; virtual memory with demand paging.',
            'Page replacement: FIFO, LRU, Optimal, Clock.',
            'Thrashing — too many frames swapping; working-set model fixes it.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Assuming locks are free — they cost context switches.',
            'Deadlock vs livelock vs starvation confusion.',
            'Forgetting TLB/MMU translation overhead when analyzing memory access cost.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['networking', 'computer network'],
    notes: [
      { title: 'Computer Network Tutorial — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/computer-network-tutorials/', source: 'GeeksforGeeks' },
    ],
    refined: {
      tagline:
        'Computer networks move data between hosts. Learn the layered model, TCP vs UDP, IP addressing, and the protocols behind the web.',
      sections: [
        {
          heading: 'Layered models',
          points: [
            'OSI: Physical, Data-Link, Network, Transport, Session, Presentation, Application.',
            'TCP/IP: Link, Internet, Transport, Application (maps loosely onto OSI).',
            'Each layer adds a header; encapsulation wraps data as it descends.',
          ],
        },
        {
          heading: 'TCP vs UDP',
          points: [
            'TCP: connection-oriented, reliable, ordered, flow/congestion control — 3-way handshake, retransmission, ACKs.',
            'UDP: connectionless, no reliability — low latency, used by video calls, DNS, games.',
          ],
        },
        {
          heading: 'IP & addressing',
          points: [
            'IPv4 32-bit, IPv6 128-bit; subnet masks / CIDR notation (192.168.1.0/24).',
            'Private vs public addresses; NAT maps private→public.',
            'DHCP assigns addresses; DNS resolves names (e.g., www.example.com → IP).',
          ],
        },
        {
          heading: 'Web protocols',
          points: [
            'HTTP request/response with methods and status codes; HTTPS = HTTP + TLS encryption.',
            'TCP handshake for TCP connections; HTTP/2 multiplexing.',
            'Routing protocols deliver packets across networks (BGP, OSPF).',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Thinking TCP vs UDP is a performance choice — it is a correctness/reliability trade-off.',
            'Confusing DNS between layers or port numbers: HTTP 80, HTTPS 443, SSH 22, DNS 53, FTP 21.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['machine learning', 'deep learning', 'ml ', 'artificial intelligence', 'ai '],
    notes: [
      { title: 'Machine Learning Tutorial — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/machine-learning/', source: 'GeeksforGeeks' },
      { title: 'Machine Learning Course — Coursera', url: 'https://www.coursera.org/learn/machine-learning', source: 'Coursera' },
    ],
    refined: {
      tagline:
        'Machine learning builds models that learn patterns from data. Know the problem types, the training pipeline, and how to evaluate honestly.',
      sections: [
        {
          heading: 'Problem types',
          points: [
            'Supervised: labeled data — regression (continuous) and classification (categorical).',
            'Unsupervised: no labels — clustering, dimensionality reduction, anomaly detection.',
            'Reinforcement: learn from reward signals by interacting with an environment.',
          ],
        },
        {
          heading: 'A typical pipeline',
          points: [
            'Collect data → clean (missing values, outliers) → split train/validation/test → feature engineer/scale → train → evaluate → iterate.',
            'Never let test data influence training choices (leakage).',
            'Cross-validation gives a stable estimate of performance.',
          ],
        },
        {
          heading: 'Key concepts',
          points: [
            'Overfitting: model memorizes training noise — fix with regularization, more data, simpler model.',
            'Underfitting: model too simple; bias-variance trade-off explains both.',
            'Common metrics: accuracy, precision, recall, F1, AUC, MSE/MAE.',
            'Gradient descent minimizes the loss function; learning rate controls step size.',
          ],
        },
        {
          heading: 'Deep learning basics',
          points: [
            'Neural network = layers of neurons with weights and activation functions.',
            'Backpropagation computes gradients; optimizers (Adam, SGD) update weights.',
            'CNNs for images, RNNs/Transformers for sequences; GPUs accelerate matrix math.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Training on imbalanced data without appropriate metrics/weights.',
            'Data leakage from normalization fitted on the full dataset.',
            'Confusing correlation with causation, and accuracy with usefulness.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['web development', 'html', 'css'],
    notes: [
      { title: 'HTML Tutorial — W3Schools', url: 'https://www.w3schools.com/html/', source: 'W3Schools' },
      { title: 'CSS Tutorial — W3Schools', url: 'https://www.w3schools.com/css/', source: 'W3Schools' },
    ],
    refined: {
      tagline:
        'Web development = HTML for structure, CSS for presentation, JavaScript for behavior. Keep concerns separated and pages accessible.',
      sections: [
        {
          heading: 'HTML structure',
          points: [
            'Semantic tags (header, nav, main, section, article, footer) help SEO and accessibility.',
            'Forms: input types (text, email, number), buttons, labels; validation attributes (required, pattern).',
            'Attributes: id (unique), class (reusable), src/href, alt for images.',
          ],
        },
        {
          heading: 'CSS fundamentals',
          points: [
            'Selectors, specificity, inheritance, cascading — specificity beats source order.',
            'Box model: content + padding + border + margin; box-sizing: border-box simplifies layout.',
            'Display types: block, inline, flexbox, grid.',
            'Positioning: static, relative, absolute, fixed, sticky.',
          ],
        },
        {
          heading: 'Layout & responsiveness',
          points: [
            'Flexbox: one-dimensional layout (row/column, wrap, gap, justify/align).',
            'Grid: two-dimensional rows+columns with explicit placement.',
            'Media queries, rem/em/% units, and fluid images for mobile-friendly design.',
            'Mobile-first is the common workflow.',
          ],
        },
        {
          heading: 'Accessibility & performance',
          points: [
            'Alt text, aria-labels, keyboard navigation, logical heading order.',
            'Minimize payloads: lazy images, bundling, critical CSS.',
            'Test at multiple viewport sizes.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Using div-only markup and tables for layout.',
            'Forgetting meta viewport for mobile.',
            'Inline styles overriding maintainable CSS; heavy specificity wars.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['software engineering', 'system design'],
    notes: [
      { title: 'System Design Tutorial — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/system-design-tutorial/', source: 'GeeksforGeeks' },
    ],
    refined: {
      tagline:
        'System design first gathers requirements, then picks components to meet scale, latency and reliability goals. Practice the back-of-envelope math.',
      sections: [
        {
          heading: 'Start with requirements',
          points: [
            'Clarify functional (features) and non-functional requirements (latency, availability, consistency, scale).',
            'Estimate scale: DAU, requests/sec, data volume, read:write ratio.',
            'Back-of-envelope: e.g., 1M DAU × 10 actions → 10M req/day ≈ 115 req/s.',
          ],
        },
        {
          heading: 'Core building blocks',
          points: [
            'Load balancer, CDN, caching (Redis/memcached), message queue (Kafka/RabbitMQ).',
            'Database choices: relational for transactions, NoSQL for key-value/document/wide-column.',
            'Search engines (Elasticsearch), object storage (S3), monitoring/logging.',
          ],
        },
        {
          heading: 'Scaling databases',
          points: [
            'Vertical scaling (bigger machine) caps out; horizontal = sharding/splitting.',
            'Read replicas handle read-heavy loads; write throughput needs sharding.',
            'Partitioning key choice shapes hot spots; consistent hashing distributes data.',
            'Indexes and caching reduce most read latency.',
          ],
        },
        {
          heading: 'Consistency & trade-offs',
          points: [
            'CAP: pick two of Consistency, Availability, Partition-tolerance.',
            'Strong vs eventual consistency; conflict resolution strategies.',
            'Idempotency for retries; timeouts and circuit breakers for failure isolation.',
            'Backup and disaster-recovery plans matter at scale.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Designing for millions when the interview scope is thousands.',
            'Ignoring read/write ratio and latency targets.',
            'Single points of failure without redundancy.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
  {
    keywords: ['interview', 'placement', 'aptitude'],
    notes: [
      { title: 'Data Structures & Algorithms Course — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/data-structures/', source: 'GeeksforGeeks' },
      { title: 'DSA Sheet (Interview Practice) — GeeksforGeeks', url: 'https://www.geeksforgeeks.org/dsa-sheet-by-love-babbar/', source: 'GeeksforGeeks' },
    ],
    refined: {
      tagline:
        'Placement and interview prep = revison of core CS subjects + daily DSA practice + structured aptitude. Consistency beats cramming.',
      sections: [
        {
          heading: 'DSA strategy',
          points: [
            'Cover in order: arrays/strings → hashing → linked lists → stacks/queues → trees → graphs → recursion/backtracking → DP → greedy → bit manipulation.',
            'Learn each topic\u2019s patterns, then solve 3–5 problems per pattern with complexity analysis.',
            'Re-solve problems after a gap; maintain a personal repository of solved classics.',
          ],
        },
        {
          heading: 'Core CS subjects',
          points: [
            'OS: processes, scheduling, deadlock, paging. DBMS: SQL, normalization, transactions, indexing.',
            'Networking: TCP/IP, OSI, HTTP. OOP + OOAD basics. DBMS and OS carry most weight.',
            'Aptitude: quantitative, logical reasoning, verbal — practice speed-based mock tests.',
          ],
        },
        {
          heading: 'Interview process',
          points: [
            'Online assessment → technical rounds (DSA, system design, CS fundamentals) → HR.',
            'Verbalize your approach before coding: brute force → optimize → edge cases.',
            'Implement clean code with correct complexity; test with sample + edge cases.',
          ],
        },
        {
          heading: 'Pitfalls',
          points: [
            'Jumping to hard problems without mastering basics.',
            'Skipping complexity analysis and edge cases.',
            'Last-minute cramming — study steadily over weeks.',
          ],
        },
      ],
      iitSources: nptelRef(IIT_DSA),
    },
  },
]

// Find the best ready-made web notes for a topic name.
export function findWebNotes(topic: string, limit = 3): WebNote[] {
  const text = topic.toLowerCase()
  const seen = new Set<string>()
  const out: WebNote[] = []

  for (const entry of WEB_NOTE_ENTRIES) {
    if (!entry.keywords.some((k) => text.includes(k))) continue
    for (const note of entry.notes) {
      if (seen.has(note.url)) continue
      seen.add(note.url)
      out.push(note)
      if (out.length >= limit) return out
    }
  }

  // Universal fallback for any unmatched topic: no dead links — the Notes
  // dialog builds real refined notes for it instead (see loadRefinedNotesFor).
  return out
}

// Find the refined notes for a topic (authored/rewritten from IIT & NIT lecture notes).
export function findRefinedNotes(topic: string): RefinedNote | null {
  const text = topic.toLowerCase()
  for (const entry of WEB_NOTE_ENTRIES) {
    if (!entry.refined) continue
    if (entry.keywords.some((k) => text.includes(k))) {
      return entry.refined
    }
  }
  return null
}

// All sources for a topic's notes: IIT/NIT references + best web notes.
export function refinedSourcesFor(topic: string): WebNote[] {
  const refined = findRefinedNotes(topic)
  const seen = new Set<string>()
  const out: WebNote[] = []
  const push = (note: WebNote) => {
    if (seen.has(note.url)) return
    seen.add(note.url)
    out.push(note)
  }
  ;(refined?.iitSources ?? []).forEach(push)
  if (refined) push(IIT_DSA)
  findWebNotes(topic, 4).forEach(push)
  return out.slice(0, 6)
}

function sanitizeFileName(name: string): string {
  return (
    name
      .trim()
      .replace(/[\\/:*?"<>|]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'topic'
  )
}

export function pdfFileName(topic: string): string {
  return `${sanitizeFileName(topic)}-notes.pdf`
}

// Well-known topic keywords mapped to a great search query; the user lands on
// YouTube with the best explained videos for that topic at the top.
const YT_QUERIES: Array<[string, string]> = [
  ['binary search tree', 'binary search tree bst full tutorial'],
  ['binary tree', 'binary tree full tutorial'],
  ['tree', 'tree data structure full tutorial'],
  ['sliding window', 'sliding window technique explained'],
  ['dynamic programming', 'dynamic programming full course'],
  ['divide and conquer', 'divide and conquer algorithm explained'],
  ['object-oriented', 'object oriented programming full course'],
  ['operating system', 'operating systems full course'],
  ['machine learning', 'machine learning full course'],
  ['system design', 'system design full course'],
  ['software engineering', 'software engineering full course'],
  ['web development', 'web development full course'],
  ['computer network', 'computer networking full course'],
  ['networking', 'computer networking full course'],
  ['number theory', 'number theory for competitive programming'],
  ['complexity', 'big o notation explained'],
  ['backtrack', 'backtracking algorithm explained'],
  ['greedy', 'greedy algorithms explained'],
  ['recursion', 'recursion explained simply'],
  ['bitwise', 'bit manipulation full tutorial'],
  ['bit manipulation', 'bit manipulation full tutorial'],
  ['linked list', 'linked list full tutorial'],
  ['priority queue', 'heap and priority queue full tutorial'],
  ['heap', 'heap data structure full tutorial'],
  ['hashing', 'hashing data structure full tutorial'],
  ['hash', 'hashing data structure full tutorial'],
  ['sorting', 'sorting algorithms explained'],
  ['searching', 'binary search explained'],
  ['javascript', 'javascript full course for beginners'],
  ['python', 'python full course for beginners'],
  ['array', 'array data structure full tutorial'],
  ['string', 'strings in programming explained'],
  ['stack', 'stack data structure full tutorial'],
  ['queue', 'queue data structure full tutorial'],
  ['graph', 'graph algorithms full course'],
  ['sql', 'sql full course for beginners'],
  ['database', 'database and dbms full course'],
  ['dbms', 'database and dbms full course'],
  ['java', 'java full course for beginners'],
  ['c++', 'c++ full course for beginners'],
  ['cpp', 'c++ full course for beginners'],
  ['c programming', 'c programming full course for beginners'],
  ['react', 'react full course for beginners'],
  ['html', 'html and css full course'],
  ['css', 'html and css full course'],
  ['interview', 'coding interview preparation'],
  ['aptitude', 'aptitude tricks for placement'],
]

// Build a YouTube link that covers the topic (and, when given, the exact
// resource) with well-explained videos.
export function youtubeLinkFor(topic: string, hint = ''): string {
  const text = topic.trim().toLowerCase()
  let best: string | null = null
  for (const [key, q] of YT_QUERIES) {
    if (text.includes(key)) {
      if (!best || key.length > best.length) best = q
    }
  }
  let query = best
  if (!query) {
    query = hint && hint.trim() ? `${topic.trim()} ${hint.trim()}` : `${topic.trim()} full tutorial`
  }
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}

// ---- Fallback notes: real, refined notes with real-world examples ----
// (No dead-end links. For topics without curated notes we build genuine,
// simple-to-understand notes with everyday examples — and when possible we
// refine the topic's live reference content from Wikipedia into a clean note.)

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

async function fetchText(url: string): Promise<string> {
  const ipc = (window as any).electron?.ipcRenderer
  if (ipc && typeof ipc.invoke === 'function') {
    return await ipc.invoke('course:fetch:text', url)
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.text()
}

// Fetch the opening plain-text definition of a topic from Wikipedia's summary API.
async function fetchWikiExtract(topic: string): Promise<string | null> {
  const title = topic.trim().replace(/\s+/g, '_').replace(/[#'<>]/g, '')
  if (!title) return null
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  try {
    const text = await fetchText(url)
    const data = JSON.parse(text)
    if (data && typeof data.extract === 'string') {
      const extract = data.extract.trim()
      return extract.length > 0 ? extract : null
    }
    return null
  } catch {
    return null
  }
}

function realWorldSection(topic: string): RefinedSection {
  const name = topic.trim()
  return {
    heading: 'Real-world example — understand it like one of your daily tasks',
    points: [
      `Think of ${name} the way you think of cooking: you follow a few steps in a certain order, you keep an eye on the state of things (heat, time, ingredients), and when something changes you adapt. Whenever you study ${name}, ask three questions: what are the steps, what order do they follow, and what happens if a step breaks.`,
      `The apps you use every day rely on exactly these ideas. When you search for a product, message a friend, or book a ride, the system is quietly doing the same kind of thinking that you are learning under the name ${name}.`,
      `Make it personal: connect one rule of ${name} to something you already use — a playlist (order matters), a shopping list (states and counts), or a map app (shortest path). Once you see the pattern in daily life, the theory stops feeling abstract.`,
    ],
  }
}

function makeItStickSection(topic: string): RefinedSection {
  const name = topic.trim()
  return {
    heading: 'Simple way to make it stick',
    points: [
      `Explain ${name} to a friend in three sentences using a daily object (a recipe, a budget, or a game). If you cannot, you have not understood it yet — go back and reread the basics.`,
      `Write down two examples that work, then two examples that break it. Understanding the failures teaches you the rules faster than memorizing definitions.`,
      `Try one tiny hands-on task with ${name} today. Practice beats reading, and small wins build real confidence.`,
    ],
  }
}

function commonMistakesSection(): RefinedSection {
  return {
    heading: 'Common mistakes to avoid',
    points: [
      'Jumping into advanced details before you can explain the topic in your own words.',
      'Memorizing definitions instead of asking \u201cwhy\u201d and testing them on a simple example.',
      'Skipping the basics because they \u201cfeel obvious\u201d — the basics are what everything else stands on.',
      'Giving up early when a concept feels hard; rest, then reread it once more with a fresh example.',
    ],
  }
}

function buildFallbackRefined(topic: string): RefinedNote {
  const name = topic.trim()
  return {
    tagline: `A simple, friendly guide to ${name} written for anyone — no background needed. Read it with a cup of tea and a clear head.`,
    sections: [
      {
        heading: 'In simple words',
        points: [
          `${name} is a topic you will meet in study and in real work. Take a breath: it is built from small ideas, and each small idea makes sense on its own.`,
          `Break the name down — ${name}. Split it into the few words it contains and describe each word in one plain sentence. You already know more about it than you think.`,
          'Search the phrase \u201cwhat is ' + name + ' in simple terms\u201d — one clear, casual explanation beats three heavy formal ones.',
        ],
      },
      realWorldSection(name),
      makeItStickSection(name),
      commonMistakesSection(),
    ],
    iitSources: [],
  }
}

function buildWikiNotes(topic: string, extract: string): RefinedNote {
  const name = topic.trim()
  const sents = sentences(extract).slice(0, 10)
  const sections: RefinedSection[] = []
  if (sents.length > 0) {
    sections.push({
      heading: 'Understand the basics',
      points: sents.slice(0, 8),
    })
  }
  sections.push(realWorldSection(name))
  sections.push(makeItStickSection(name))
  sections.push(commonMistakesSection())
  return {
    tagline: `A simple, refined guide to ${name} — rewritten from reference sources into everyday language with real-world examples.`,
    sections,
    iitSources: [],
  }
}

// Load the best notes for any topic: curated first, then live Wikipedia
// content refined into simple notes, and finally a friendly built-in guide.
export async function loadRefinedNotesFor(topic: string): Promise<RefinedNote> {
  const name = topic.trim()
  const curated = findRefinedNotes(name)
  if (curated) return curated
  const extract = await fetchWikiExtract(name)
  if (extract) return buildWikiNotes(name, extract)
  return buildFallbackRefined(name)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Render the refined notes as a clean, printable HTML document (used for the PDF).
export function renderNoteHtml(topic: string, refined: RefinedNote): string {
  const name = escapeHtml(topic.trim())
  const tagline = refined.tagline ? `<p class="tag">${escapeHtml(refined.tagline)}</p>` : ''
  const sections = refined.sections
    .map(
      (s) =>
        `<h2>${escapeHtml(s.heading)}</h2>` +
        `<ul>${s.points.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`
    )
    .join('')

  const sources = refinedSourcesFor(topic)
    .map(
      (src) => `<li class="src"><a href="${escapeHtml(src.url)}">${escapeHtml(src.title)}</a><span class="src-src"> — ${escapeHtml(src.source)}</span></li>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${name} — Refined Notes</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 760px; margin: 0 auto; padding: 28px 32px; }
  h1 { font-size: 24px; margin: 0 0 6px; color: #0f172a; }
  .tag { color: #475569; font-style: italic; margin: 0 0 20px; font-size: 14px; }
  h2 { font-size: 16px; margin: 20px 0 8px; color: #0f766e; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  ul { margin: 0 0 14px; padding-left: 22px; }
  li { margin-bottom: 5px; font-size: 14px; }
  .sources { margin-top: 24px; }
  .src a { color: #1d4ed8; text-decoration: none; }
  .src-src { color: #64748b; font-size: 12px; }
  .foot { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
</style>
</head>
<body>
  <h1>${name} — Refined Notes</h1>
  <p class="tag">Simple language, real-world examples, ready to study offline.</p>
  ${tagline}
  ${sections}
  ${
    sources
      ? `<div class="sources"><h2>Sources</h2><ul>${sources}</ul></div>`
      : ''
  }
  <p class="foot">Prepared by MI Coding Tracker — study notes generated from curated and reference content.</p>
</body>
</html>`
}