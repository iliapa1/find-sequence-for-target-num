# find-sequence-for-target-num
This webpage uses a simple genetic algorithm to find a string of 0s and 1s which evaluates to the given target number. 


<h1>Decoding rules</h1>
0:         0000
1:         0001
2:         0010
3:         0011
4:         0100
5:         0101
6:         0110
7:         0111
8:         1000
9:         1001
+:         1010
-:         1011
*:         1100
/:         1101

These genes are evaluated left to right. Any which don't conform to the pattern 'number -> operator -> number ...' are ignored.
E.g.
0110 1010 0101 1100 0100 1101 0010 1010 0001
6        +        5        *        4         /        2        +       1
Which, in the end, evaluates to 23.
