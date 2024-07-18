const comparisonOperators = [">", "<", ">=", "<=", "==", "!="];
const operations = ["+=", "-=", "/=", "*=", "++", "--", "="];
const arithOperations = ["+", "-", "/", "*"];

function getBiggestBigOString(bigOStrings) {
    var numberNsList = [];
    var maxNs = 0;
    for(var i = 0; i < bigOStrings.length; i++) {
        var bigOStr = bigOStrings[i];
        var numberNs = 0;
        for(var k = 0; k < bigOStr.length; k++) {
            var c = bigOStr[k];
            if (c == 'N') {
                numberNs++;
            }
        }
        if(numberNs > maxNs) {
            maxNs = numberNs;
        }
        numberNsList.push(numberNs);
    }
    topBigNStrings = [];
    for(var i = 0; i < numberNsList.length; i++) {
        if(numberNsList[i] == maxNs) {
            topBigNStrings.push(bigOStrings[i]);
        }
    }
    if(topBigNStrings.length == 1) {
        return topBigNStrings[0];
    }
    var maxLsIndex = 0;
    var maxLsCount = 0;
    for(var i = 0; i < topBigNStrings.length; i++) {
        var str = topBigNStrings[i];
        var LsCount = 0;
        for(var k = 0; k < str.length; k++) {
            var c = str[k];
            if(c == 'L') {
                LsCount++;
            }
        }
        if(LsCount > maxLsCount) {
            maxLsCount = LsCount;
            maxLsIndex = i;
        }
    }
    return topBigNStrings[maxLsIndex];
}

function translateBigOStringToBigO(bigOString) {
    var nCount = 0;
    var lCount = 0;
    for(var i = 0; i < bigOString.length; i++) {
        var c = bigOString[i];
        if (c == 'N') {
            nCount++;
        }
        else if(c == 'L') {
            lCount++;
        }
    }
    res = "";
    if(nCount > 0) {
        if(nCount > 1) {
            res += "N&nbsp;<sup class='subscript'>" + nCount + "</sup>";
        }
        else {
            res += "N";
        }
    }
    if(lCount > 0) {
        if(lCount > 1) {
            res += "log&nbsp;<sup class='subscript'>" + lCount + "</sup>(N)";
        }
        else {
            res += "log(N)";
        }
    }
    if(nCount == 0 && lCount == 0) {
        res += "1";
    }
    return "O(" + res + ")";
}

function getForStatements(linesOfCode) {
    let forStatements = [];
    var level = 1;
    linesOfCode.forEach(line => {
        let isFor = line.indexOf("for");
        let isClosingStatement = line.indexOf("}")
        if(isFor > -1) {
            lineObj = {
                "line": line,
                "level": level
            }
            forStatements.push(lineObj);
            level += 1;
        }
        if(isClosingStatement > -1) {
            level -= 1;
        }
    });
    return forStatements;
}

function checkAlphaNumeric(lexicon) {
    const alphaRegex = "^[a-zA-Z]*$"
    const numericRegex = "^[0-9]*$"
    const alphaNumericRegex = "^[a-zA-Z0-9]*$"
    lexicon = lexicon.trim();
    let mN = lexicon.match(numericRegex)
    let mAN = lexicon.match(alphaNumericRegex)
    var res;
    if(mN) {
        res = "num";
    }
    else if(mAN) {
        if(lexicon[0].match(alphaRegex)) {
            res = "var";
        }
        else {
            res = "err";
        }
    }
    else {
        res = "err";
    }
    return res;
}

function evaluateForStatement(forLine) {
    let forLineSplit = forLine['line'].split("(");
    let level = forLine['level'];
    let forLineLogic = forLineSplit[1].split(";");
    let varInstantiation = forLineLogic[0];
    let range = forLineLogic[1];
    let operation = forLineLogic[2].split(")")[0];
    var initValue = varInstantiation.split("=");
    initValue = initValue[initValue.length - 1];
    var rangeStop;
    for(var i = 0; i < comparisonOperators.length; i++) {
        let op = comparisonOperators[i];
        if(range.indexOf(op) > -1) {
            let rangeStopSplit = range.split(op);
            rangeStop = rangeStopSplit[rangeStopSplit.length - 1];
            break;
        }
    }
    var operationDone;
    for(var i = 0; i < operations.length; i++) {
        let op = operations[i];
        if(operation.indexOf(op) > -1) {
            if(op === "=") {
                operationDone = "lazy"
            }
            else {
                if(op === "++" || op === "--") {
                    let lex = operation.split(op)[0];
                    let typeCheck = checkAlphaNumeric(lex)
                    if(typeCheck === "var") {
                        operationDone = "lin";
                    }
                    else {
                        operationDone = "err";
                    }   
                }
                if (op === "+=" || op === "-=") {
                    let operationSplit = operation.split(op);
                    let leftLex = operationSplit[0];
                    let rightLex = operationSplit[1];
                    let leftTypeCheck = checkAlphaNumeric(leftLex);
                    let rightTypeCheck = checkAlphaNumeric(rightLex);
                    if(leftTypeCheck === "var") {
                        if(rightTypeCheck === "num") {
                            rightLex = rightLex.trim();
                            let rightLexVal = Number(rightLex);
                            if(rightLexVal > 0) {
                                operationDone = "lin";
                            }
                            else {
                                operationDone = "err";
                            }
                        }
                        else {
                            operationDone = "err";
                        }
                    }
                    else {
                        operationDone = "err";
                    }
                }
                if(op === "*=" || op === "/=") {
                    let operationSplit = operation.split(op);
                    let leftLex = operationSplit[0];
                    let rightLex = operationSplit[1];
                    let leftTypeCheck = checkAlphaNumeric(leftLex);
                    let rightTypeCheck = checkAlphaNumeric(rightLex);
                    if(leftTypeCheck === "var") {
                        if(rightTypeCheck === "num") {
                            rightLex = rightLex.trim();
                            let rightLexVal = Number(rightLex);
                            if(rightLexVal > 1) {
                                operationDone = "log";
                            }
                            else {
                                operationDone = "err";
                            }
                        }
                        else {
                            operationDone = "err";
                        }
                    }
                    else {
                        operationDone = "err";
                    }
                }
            }
            break;
        }
        operationDone = "err";
    }
    return {
        "eval": operationDone,
        "level": level
    }
}

function getBigONotation(forStatements) {
    var val_results = [];
    forStatements.forEach(forLine => {
        let r = evaluateForStatement(forLine);
        val_results.push(r);
    })
    var bigORes;
    var bigOString = "";
    var bigOList = [];
    var hasError = false;
    var isLazy = false;
    for(var i = 0; i < val_results.length; i++) {
        let val_result = val_results[i];
        let eval = val_result['eval'];
        let level = val_result['level'];
        if(i != 0 && level == 1) {
            bigOList.push(bigOString);
            bigOString = "";
        }
        if(eval === "err") {
            hasError = true;
            break;
        }
        if(eval == "lazy") {
            isLazy = true;
            break;
        }
        else if(eval === "lin") {
            bigOString += "N";
        }
        else if(eval == 'log') {
            bigOString += "L"
        }
        else if(eval == "const") {
            bigOString += "O"
        }
        else {
            hasError = true;
        }
    }
    if(hasError) {
        bigOList.push(bigOString);
        bigORes = getBiggestBigOString(bigOList);
        return translateBigOStringToBigO(bigORes);
    }
    if(isLazy) {
        bigOList.push(bigOString);
        bigORes = getBiggestBigOString(bigOList);
        return translateBigOStringToBigO(bigORes);
    }
    bigORes = getBiggestBigOString(bigOList);
    var finalResult = translateBigOStringToBigO(bigORes);
    return finalResult;
}
function calculateBigO() {
    document.getElementById('resultShow').innerText = '';
    var language = document.getElementById('languageOption').value;
    var codeInput = document.getElementById('codeInput').value.trim();
    if (codeInput === '') {
        alert('Please enter code before calculating Big O notation.');
        return;
    }
    if (language === '') {
        alert('Please select a language.');
        return;
    }
    var linesOfCode = codeInput.split('\n');
    var forStatements = getForStatements(linesOfCode);
    var result = getBigONotation(forStatements);
    document.getElementById('resultShow').innerText = result;
}
document.getElementById('getBigOBtn').addEventListener('click', calculateBigO);
