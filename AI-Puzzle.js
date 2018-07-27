let puzzleImg = 1;
let sum = 0;
let arr = [];
let shuffleArr = [];
let tempArr = [];
let trueWay = [];

for (let i = 0; i < 16; ++i) {
    arr[i] = i;
}


$(function () {
    for (let i = 0; i < 15; i++) {
        let puzzlePart = document.createElement("div");
        puzzlePart.className = "puzzle";
        puzzlePart.id = i.toString();
        puzzlePart.puzzleIndex = i;
        $("#game-position").append(puzzlePart);
        $("#" + i).addClass("puzzle" + (i + 1)).addClass("puzzle-image-" + puzzleImg);
    }
    let emptyPart = document.createElement("div");
    emptyPart.className = "empty-part";
    emptyPart.id = "15";
    emptyPart.puzzleIndex = 15;
    $("#game-position").append(emptyPart);

    $("#reset").click(shuffleHandler);
    $("#select-area").click(selectHandler);
    $("#AI").click(aiHandler);
});

let targetIndex,
    emptyIndex;

function aiHandler() {
    console.time("AI");
    AIPuzzle();
    console.timeEnd("AI");
    swapThePuzzlePart();

}

function selectHandler(event) {
    if (event.target.className === "sbtn") {
        for (let i = 0; i < 15; i++) {
            let newClass = "puzzle" + " puzzle" + (i + 1) + " puzzle-image-" + event.target.value;
            document.getElementById(i.toString()).className = newClass;
            puzzleImg = event.target.value;
        }
        for (let i = 0; i < 15; i++) {
            let targetIndex = i,
                selfIndex = arr.indexOf(i);
            let targetX = targetIndex % 4,
                targetY = Math.floor(targetIndex / 4),
                selfX = selfIndex % 4,
                selfY = Math.floor(selfIndex / 4);
            let xOffset = "+=" + (targetX - selfX) * 90 + "px",
                yOffset = "+=" + (targetY - selfY) * 90 + "px";
            $("#" + i).animate({
                "left": xOffset,
                "top": yOffset
            }, 300);
        }
        for (let i = 0; i < 16; i++) {
            arr[i] = i;
            shuffleArr[i] = i;
        }
        setTimeout(resetDOM, 300);
    }
}

function resetDOM() {
    $("#game-position").empty();
    for (let i = 0; i < 15; i++) {
        let puzzlePart = document.createElement("div");
        puzzlePart.className = "puzzle";
        puzzlePart.id = shuffleArr[i];
        puzzlePart.puzzleIndex = shuffleArr[i];
        $("#game-position").append(puzzlePart);
        $("#" + shuffleArr[i]).addClass("puzzle" + (shuffleArr[i] + 1)).addClass("puzzle-image-" + puzzleImg);
    }
    let emptyPart = document.createElement("div");
    emptyPart.className = "empty-part";
    emptyPart.id = "15";
    emptyPart.puzzleIndex = 15;
    $("#game-position").append(emptyPart);
    searchedNodes = [];
    tempNodes = [];
}

function shuffleHandler() {
    document.getElementById("result").className = "hidden";
    shuffleTheArr();
    for (let i = 0; i < 15; i++) {
        let targetIndex = shuffleArr.indexOf(i),
            selfIndex = arr.indexOf(i);
        let targetX = targetIndex % 4,
            targetY = Math.floor(targetIndex / 4),
            selfX = selfIndex % 4,
            selfY = Math.floor(selfIndex / 4);
        let xOffset = "+=" + (targetX - selfX) * 90 + "px",
            yOffset = "+=" + (targetY - selfY) * 90 + "px";
        $("#" + i).animate({
            "left": xOffset,
            "top": yOffset
        }, 300);
    }
    setTimeout(resetDOM, 300);
    for (let i = 0; i < 16; i++)
        arr[i] = shuffleArr[i];
    searchedNodes = [];
    tempNodes = [];
}

function shuffleTheArr() {
    shuffleArr = [];
    tempArr = [];
    sum = 0;
    shuffleArr[15] = 15;
    for (let i = 0; i < 15; i++) {
        let index = Math.floor((Math.random() * 15));
        while (shuffleArr[index] !== undefined)
            index = Math.floor((Math.random() * 15));
        shuffleArr[index] = i;
        tempArr[index] = i;
    }
    countTheInversionNum(0, 14);
    if (sum % 2 === 1) {
        let temp = shuffleArr[13];
        shuffleArr[13] = shuffleArr[14];
        shuffleArr[14] = temp;
    }
}

//逆序数归并算法
function countTheInversionNum(start, end) {
    if (start < end) {
        let mid = Math.floor((start + end) / 2);
        countTheInversionNum(start, mid);
        countTheInversionNum(mid + 1, end);
        let i = start,
            j = mid + 1;
        while (i <= mid && j <= end) {
            if (tempArr[i] <= tempArr[j])
                j++;
            else {
                sum += (end - j + 1);
                i++;
            }
        }
        Merge(start, end);
    }
}

function Merge(start, end) {
    if (start >= end) return;
    let mid = Math.floor((start + end) / 2);
    let temp = [];
    let i = start,
        j = mid + 1,
        k = 0;
    while (i <= mid && j <= end) {
        if (tempArr[i] > tempArr[j]) {
            temp[k] = tempArr[i];
            k++;
            i++;
        } else {
            temp[k] = tempArr[j];
            k++;
            j++;
        }
    }
    while (i <= mid) {
        temp[k] = tempArr[i];
        k++;
        i++;
    }
    while (j <= end) {
        temp[k] = tempArr[j];
        k++;
        j++;
    }
    for (let m = start, n = 0; m <= end; m++, n++)
        tempArr[m] = temp[n];
}

/**********************************************************************************************************
 *                                                 AI-Puzzle                                              *
 **********************************************************************************************************/
 

let searchedNodes = [],
    tempNodes = [];

function AIPuzzle() {
    let count = 0;
    tempNodes.push({
        dir: null,
        parentIndex: null,
        cost: 0,
        state: arr.slice(0)
    });
    let win = true;
    for (let i = 0; i < 16; i++) {
        if (i !== tempNodes[0].state[i]) {
            win = false;
            break;
        }
    }
    if (win) return trueWay;
    while (tempNodes.length !== 0 && count < 29000) {
        count++;
        findTheMinCostNode();
        let node = tempNodes.pop();
        searchedNodes.push(node);
        let adjacentNodes = [];
        // moveEmptyUp
        let newNode = moveEmptyUp(node);
        if (newNode !== null) adjacentNodes.push(newNode);
        // moveEmptyRight
        newNode = moveEmptyRight(node);
        if (newNode !== null) adjacentNodes.push(newNode);
        // moveEmptyDown
        newNode = moveEmptyDown(node);
        if (newNode !== null) adjacentNodes.push(newNode);
        // moveEmptyLeft
        newNode = moveEmptyLeft(node);
        if (newNode !== null) adjacentNodes.push(newNode);
        // add these nodes to tempNodes and check if success
        let found = false;
        for (let i = 0; i < adjacentNodes.length; ++i) {
            let success = true;
            adjacentNodes[i].parentIndex = searchedNodes.length - 1;
            for (let j = 0; j < 16; ++j) {
                if (j !== adjacentNodes[i].state[j]) {
                    success = false;
                    break;
                }
            }
            if (success) {
                trueWay = findWay(adjacentNodes[i]);
                found = true;
                break;
            }
            tempNodes.push(adjacentNodes[i]);
        }
        if (found) break;
    }
}

function findTheMinCostNode() {
    let minIndex = tempNodes.length - 1;
    for (let i = minIndex - 1; i >= 0; --i) {
        if (tempNodes[i].cost < tempNodes[minIndex].cost) {
            minIndex = i;
        }
    }
    // swap
    if (minIndex < tempNodes.length - 1) {
        let temp = tempNodes[tempNodes.length - 1];
        tempNodes[tempNodes.length - 1] = tempNodes[minIndex];
        tempNodes[minIndex] = temp;
    }
}

function swapThePuzzlePart() {
    if (trueWay.length === 0) {
        return;
    }
    let dir = trueWay.pop();
    emptyIndex = arr.indexOf(15);
    switch (dir) {
        case 0:
            targetIndex = emptyIndex - 4;
            break;
        case 1:
            targetIndex = emptyIndex + 1;
            break;
        case 2:
            targetIndex = emptyIndex + 4;
            break;
        case 3:
            targetIndex = emptyIndex - 1;
            break;
        default:
            return;
    }
    let targetX = targetIndex % 4,
        targetY = Math.floor(targetIndex / 4),
        emptyX = emptyIndex % 4,
        emptyY = Math.floor(emptyIndex / 4);
    let xOffset = "+=" + (emptyX - targetX) * 90 + "px",
        yOffset = "+=" + (emptyY - targetY) * 90 + "px";
    $("#" + arr[targetIndex]).animate({
        "left": xOffset,
        "top": yOffset
    }, 100, swapThePuzzlePart);
    //arr swap
    let temp = arr[targetIndex];
    arr[targetIndex] = 15;
    arr[emptyIndex] = temp;
}

function findWay(node) {
    let way = [];
    way.push(node.dir);
    let p = node.parentIndex;
    while (searchedNodes[p].parentIndex !== null) {
        way.push(searchedNodes[p].dir);
        p = searchedNodes[p].parentIndex;
    }
    return way;
}

// check the node has checked or not
function checkNode(node) {
    for (let i = 0; i < searchedNodes.length; ++i) {
        let isChecked = true;
        for (let j = 0; j < 16; ++j) {
            if (searchedNodes[i].state[j] !== node.state[j]) {
                isChecked = false;
                break;
            }
        }
        if (isChecked) return true;
    }
    return false;
}

function moveEmptyUp(node) {
    let emptyIndex = node.state.indexOf(15);
    if (emptyIndex > 3) {
        let newNode = {
            dir: 0,
            state: node.state.slice(0)
        };
        let temp = newNode.state[emptyIndex - 4];
        newNode.state[emptyIndex - 4] = 15;
        newNode.state[emptyIndex] = temp;
        // check it has checked or not
        let isChecked = checkNode(newNode);
        if (!isChecked) {
            let c1 = cf1(newNode),
                c2 = cf2(newNode);
            newNode.cost = c1 + 2 * c2;
            return newNode;
        } else return null;
    }
    return null;
}

function moveEmptyRight(node) {
    let emptyIndex = node.state.indexOf(15);
    if (emptyIndex % 4 < 3) {
        let newNode = {
            dir: 1,
            state: node.state.slice(0)
        };
        let temp = newNode.state[emptyIndex + 1];
        newNode.state[emptyIndex + 1] = 15;
        newNode.state[emptyIndex] = temp;
        // check it has checked or not
        let isChecked = checkNode(newNode);
        if (!isChecked) {
            let c1 = cf1(newNode),
                c2 = cf2(newNode);
            newNode.cost = c1 + 2 * c2;
            return newNode;
        } else return null;
    }
    return null;
}

function moveEmptyDown(node) {
    let emptyIndex = node.state.indexOf(15);
    if (emptyIndex < 12) {
        let newNode = {
            dir: 2,
            state: node.state.slice(0)
        };
        let temp = newNode.state[emptyIndex + 4];
        newNode.state[emptyIndex + 4] = 15;
        newNode.state[emptyIndex] = temp;
        // check it has checked or not
        let isChecked = checkNode(newNode);
        if (!isChecked) {
            let c1 = cf1(newNode),
                c2 = cf2(newNode);
            newNode.cost = c1 + 2 * c2;
            return newNode;
        } else return null;
    }
    return null;
}

function moveEmptyLeft(node) {
    let emptyIndex = node.state.indexOf(15);
    if (emptyIndex % 4 > 0) {
        let newNode = {
            dir: 3,
            state: node.state.slice(0)
        };
        let temp = newNode.state[emptyIndex - 1];
        newNode.state[emptyIndex - 1] = 15;
        newNode.state[emptyIndex] = temp;
        // check it has checked or not
        let isChecked = checkNode(newNode);
        if (!isChecked) {
            let c1 = cf1(newNode),
                c2 = cf2(newNode);
            newNode.cost = c1 + 2 * c2;
            return newNode;
        } else return null;
    }
    return null;
}

// cost function 1
// number of part in wrong position
function cf1(node) {
    let wrongParts = 0;
    for (let i = 0; i < 16; ++i) {
        if (node.state[i] !== i) wrongParts++;
    }
    return wrongParts;
}

// cost function 2
// the sum of distance(wrong position -> right position)
function cf2(node) {
    let distance = 0;
    for (let i = 0; i < 16; ++i) {
        let wx = i % 4,
            wy = Math.floor(i / 4),
            rx = node.state[i] % 4,
            ry = Math.floor(node.state[i] / 4);
        distance += (Math.abs(wx - rx) + Math.abs(wy - ry));
    }
    return distance;
}