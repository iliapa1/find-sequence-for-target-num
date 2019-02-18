var test = "0011"

function mutate(test) {
    let newTest = new String();
    for (let i = 0; i < test.length; i++) {
        if (test[i] == "0") newTest = newTest + "1";
        else newTest = newTest + "0"; 
    }
    return newTest;
}

test = mutate(test);
console.log(test);