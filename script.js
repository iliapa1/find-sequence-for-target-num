//Initialise JS components from Materialize framework
M.AutoInit();

document.getElementById('btnFindSolution').onclick = findSolution;
document.getElementById('btnFillDefaults').onclick = fillDefaults;
document.getElementById('btnClearSolutions').onclick = clearSolutions;

//Perhaps make a class GA which has all the functions related to the algorithm?

const defaultParams = {
    'numOfGenes' : 9,
    'chromosomesInFirstGen' : 20,
    'crossoverRate' : 0.7,
    'mutationRate' : 0.01,
    'targetNumber' : 35
};
function fillDefaults() {
    document.getElementById('numOfGenes').value = defaultParams['numOfGenes'];
    document.getElementById('chromosomesInFirstGen').value = defaultParams['chromosomesInFirstGen'];
    document.getElementById('crossoverRate').value = defaultParams['crossoverRate'];
    document.getElementById('mutationRate').value = defaultParams['mutationRate'];
    document.getElementById('targetNumber').value = defaultParams['targetNumber'];
}

function clearSolutions() {
    let divChildren = document.getElementById("solutions").childNodes;
    for (let i = divChildren.length - 1; i >= 0; i--) {
        if (divChildren[i].className == "solution-p") divChildren[i].remove();
    }
    console.log(divChildren);
}

function visualiseSolution(chromosome, fromGeneration) {
    let newP = document.createElement("p");
    let divChildren = document.getElementById("solutions").childNodes;
    newP.className = `solution-p`;
    newP.appendChild(document.createTextNode(Decoder.decode(chromosome) + " from gen " + fromGeneration));
    let div = document.getElementById("solutions");
    div.style.display = "block";
    div.appendChild(newP);
}

function findSolution() {
    const params = getParams();
    let generationCounter = 1;
    if (params != undefined) {
        let currentPopulation = generateFirstGen(params);
        assignFitnessToPopulation(currentPopulation, params);
        for (let member of currentPopulation) {
            if(member["fitness"] == 1) {
                visualiseSolution(member["chromosome"], generationCounter);
                return false;
            }
        }
        while (true) {
            generationCounter++;
            currentPopulation = generateNextGen(currentPopulation, params);
            assignFitnessToPopulation(currentPopulation, params);
            for (let member of currentPopulation) {
                if (member["fitness"] == 1) {
                    //console.log(`chromosome: ${member["chromosome"]}, fitness: ${member["fitness"]}, decodedValue: ${Decoder.decode(member["chromosome"])}, member of generation: ${generationCounter}`);
                    visualiseSolution(member["chromosome"], generationCounter);
                    return;
                }
            }
        }
    }
}


function printPopulation(population) {
    population.forEach(member => {
        console.log(`chromosome: ${member["chromosome"]}, fitness: ${member["fitness"]}, decodedValue: ${Decoder.decodeAndCalculate(member["chromosome"])}`);
    });
}

function getParams() {
    let params = {};
    params["targNum"] = document.getElementById('targetNumber').value;
    //numOfChromosomes is basically the population size
    params["numOfChromosomes"] = document.getElementById('chromosomesInFirstGen').value;
    params["numOfGenes"] = document.getElementById('numOfGenes').value;
    params["crossoverRate"] = document.getElementById('crossoverRate').value;
    params["mutationRate"] = document.getElementById('mutationRate').value
    if (params["targNum"] && params["numOfChromosomes"] && params["numOfGenes"] && params["crossoverRate"] && params["mutationRate"]) {
        return params;
    }
    else {
        alert("Please check if your input is correct!");
        return undefined;
    }
}

function generateFirstGen(params) {
    let population = [];
    for (let i = 0; i < params["numOfChromosomes"]; i++) {
        population[i] = {};
        population[i]["chromosome"] = "";
        for (let j = 0; j < params["numOfGenes"]; j++) {
            //One gene is made up of 4 zeros/ones
            for (let k = 0; k < 4; k++) {
                population[i]["chromosome"] = population[i]["chromosome"].concat(String(Math.floor(Math.random() * 2)));
            }
        }
        population[i]["fitness"] = undefined;
        //In case division by zero occurs (in which case the chromosome will evaluate to NaN or Infinity), discard current chromosome
        if (!isFinite(Decoder.decodeAndCalculate(population[i]["chromosome"]))) {
            i--;
        }
    }
    return population;
}

function assignFitnessToPopulation(population, params) {
    population.forEach(member => {
        let decodedValue = Decoder.decodeAndCalculate(member["chromosome"]);
        if (decodedValue == params["targNum"]) {
            member["fitness"] = 1;
        }
        else if (Math.abs(decodedValue - params["targNum"]) == 1) {
            //This solves the problem that fitness is evaluated to 1 when decoded value is one less or greater than target number.
            //Not really sure about the particular value.
            member["fitness"] = 0.9;
        }
        else {
            member["fitness"] = 1 / Math.abs((params["targNum"] - decodedValue));
        }
    });
}

function generateNextGen(population, params) {
    let newPopulation = selectMembers(population, population.length);
    newPopulation = crossover(newPopulation, params);
    mutate(newPopulation, params);
    return newPopulation;
}

//Roulette wheel selection is implemented in this function. In other words, the higher the fitness, the more likely a member of the population is to be picked.
//Perhaps try rank-based selection?
function selectMembers(population, selectionSize) {
    let cumulativeFitness = [];
    cumulativeFitness.push(population[0]["fitness"]);
    for (let i = 1; i < population.length; i++) {
        cumulativeFitness.push(cumulativeFitness[i-1] + population[i]["fitness"]);
    }
    let selectedMembers = new Array(selectionSize);
    for (let i = 0; i < selectionSize; i++) {
        let randomFitness = (Math.random() * cumulativeFitness[cumulativeFitness.length - 1]);
        let index = binarySearch(cumulativeFitness, randomFitness);
        if (index < 0) index = Math.abs(index + 1);
        //console.log(`chosen index: ${index}, randomFitness: ${randomFitness}, cumulativeFitness: ${cumulativeFitness[population.length-1]}`);
        selectedMembers[i] = population[index];
    }
    return selectedMembers;
}

//This binary search works much in the same way as the binary search in java. More info: https://www.geeksforgeeks.org/arrays-binarysearch-java-examples-set-1/
function binarySearch(array, value) {
    let left = 0, right = array.length;
    let middle = Math.floor((left + right) / 2);
    while (left < right) {
        if (array[middle] == value) {
            return middle;
        }
        value < array[middle] ? right = middle : left = middle + 1;  
        middle = Math.floor((left + right) / 2);      
    }
    return (-middle-1);
}

//Not sure about crossover rate. If no crossover is to be performed, should this just return the chromosomes as they were?
//TODO: Monitor if division by zero check works properly for descendants
function crossover(population, params) {
    let populationAfterCrossover = [];
    let chromosomeLength = params["numOfGenes"] * 4;
    //Handle case where population size is an odd number
    for (let i = 0; i < population.length; i += 2) {
        if (Math.random() < params["crossoverRate"]) {
            let crossoverPoint = Math.random() * chromosomeLength;
            populationAfterCrossover.push({
                "chromosome": population[i]["chromosome"].slice(0, crossoverPoint) + population[i+1]["chromosome"].slice(crossoverPoint, chromosomeLength),
                "fitness" : undefined
            });
            populationAfterCrossover.push({
                "chromosome" : population[i+1]["chromosome"].slice(0, crossoverPoint) + population[i]["chromosome"].slice(crossoverPoint, chromosomeLength),
                "fitness" : undefined
            });
        }
        else {
            populationAfterCrossover.push(population[i]);
            populationAfterCrossover.push(population[i+1]);
        }
        if (!isFinite(Decoder.decodeAndCalculate(populationAfterCrossover[populationAfterCrossover.length - 1]["chromosome"])) || !isFinite(Decoder.decodeAndCalculate(populationAfterCrossover[populationAfterCrossover.length - 2]["chromosome"]))) {
            i -= 2;
            populationAfterCrossover.pop();
            populationAfterCrossover.pop();
        }
    }
    return populationAfterCrossover;
}

function mutate(population, params) {
    population.forEach(member => {
        do {    
            var newChromosome = new String();    
            for (let i = 0; i < member["chromosome"].length; i++) {
                if (Math.random() < params["mutationRate"]) {
                    if (member["chromosome"][i] === "0") newChromosome = newChromosome + "1";
                    else newChromosome = newChromosome + "0";
                } 
                else newChromosome = newChromosome + member["chromosome"][i];
            }   
        } while (!isFinite(Decoder.decodeAndCalculate(newChromosome)));
        member["chromosome"] = newChromosome;
    });
}


class Decoder {
    /*This is called when there is a number, an operation and another number in the stack.
    It executes the operation and pushes the result to the stack.*/
    static executeLastOperationInStack() {
        let a = this.stack.pop();
        let op = this.stack.pop();
        let b = this.stack.pop();
        switch(op) {
            case "+":
                this.stack.push(b+a);
                break;
            case "-":
                this.stack.push(b-a);
                break;
            case "*":
                this.stack.push(b*a);
                break;
            case "/":
                this.stack.push(b/a);
                break;
            default:
                console.log("Stack error!");
                break;
        }
    }

    static decodeAndCalculate(chromosome) {
        while(chromosome.length > 0) {
            let nextGene = chromosome.slice(0, 4);
            chromosome = chromosome.substr(4, chromosome.length - 4);

            if (this.representation.hasOwnProperty(nextGene)) {
                if (this.stack.length > 0) {
                    if (typeof this.stack[this.stack.length - 1] == "string" && typeof this.representation[nextGene] == "number") {
                        this.stack.push(this.representation[nextGene]);
                        this.executeLastOperationInStack();
                    }
                    else if (typeof this.stack[this.stack.length - 1] == "number" && typeof this.representation[nextGene] == "string") this.stack.push(this.representation[nextGene]);
                }
                else if (typeof this.representation[nextGene] == "number") this.stack.push(this.representation[nextGene]);
            }
        }
        //In case the top element in the stack is an operation (+/-/...)
        if (typeof this.stack[this.stack.length - 1] == "string" && this.stack.length > 1) {
            this.stack.pop();
        }
        return this.stack.pop();
    }

    static decode(chromosome) {
        let toReturn = new String();
        while(chromosome.length > 0) {
            let nextGene = chromosome.slice(0, 4);
            chromosome = chromosome.substr(4, chromosome.length - 4);
            if (this.representation.hasOwnProperty(nextGene)) {
                toReturn = toReturn + " " + this.representation[nextGene];
            }
            else {
                toReturn = toReturn + " n/a";
            }
        }
        return toReturn.trim();
    }
}
//This is the only way to declare a static variable in JS :(
Decoder.representation = {
    "0000" : 0,
    "0001" : 1,
    "0010" : 2,
    "0011" : 3,
    "0100" : 4,
    "0101" : 5,
    "0110" : 6,
    "0111" : 7,
    "1000" : 8,
    "1001" : 9,
    "1010" : "+",
    "1011" : "-",
    "1100" : "*",
    "1101" : "/"
}
Decoder.stack = [];
