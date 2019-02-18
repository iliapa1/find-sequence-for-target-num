# find-sequence-for-target-num
This webpage uses a simple genetic algorithm to find a string of 0s and 1s which evaluates to the given target number. 


<h1>Decoding rules</h1>
A gene consists of a combination of four 0s or 1s. Every gene is either a number or an operator. The whole chromosome is evaluated form left to right without priority of operations.
<br>
0:         0000<br>
1:         0001<br>
2:         0010<br>
3:         0011<br>
4:         0100<br>
5:         0101<br>
6:         0110<br>
7:         0111<br>
8:         1000<br>
9:         1001<br>
+:         1010<br>
-:         1011<br>
*:         1100<br>
/:         1101<br>

Any genes which don't conform to the pattern 'number -> operator -> number ...' are ignored.<br>
E.g.<br>
0110 1010 0101 1100 0100 1101 0010 1010 0001<br>
6        +        5        *        4         /        2        +       1<br>
Which, in the end, evaluates to 23.
