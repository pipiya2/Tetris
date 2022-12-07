const mapX = 12;
const mapY = 20;
const canvas = document.getElementById("tetris-canvas");
const nextBlockCanvas = document.getElementById('tetris-nextBlock-canvas');
const ctx = canvas.getContext('2d');
const blockCtx = nextBlockCanvas.getContext('2d');
const borderWidth = 1;
const blockSize = 20;
let map;
let stackMap;
let shape = new Object();
let locateNum = 0;
let downInterval;
let startX = 5;
let downY = 0;
let score = 0;
let speed = 0;
let downLevel = 800;
let randomBlockList = new Array(4);
let isGaming = false;
const blocks ={
    I : {
        color : "skyblue",
        shape : [
            [
                [0,0],[1,0],[2,0],[3,0]
            ],
            [
                [0,0],[0,1],[0,2],[0,3]
            ]
        ]
    },
    O : {
        color : "yellow",
        shape : [
            [
                [0,0],[0,1],[1,0],[1,1]
            ]
        ]
    },
    Z : {
        color : "red",
        shape : [
            [
                [0,0],[0,1],[1,1],[1,2]
            ],
            [
                [0,1],[1,0],[1,1],[2,0]
            ]
        ]
    },
    S : {
        color : "green",
        shape : [
            [
                [0,1],[0,2],[1,0],[1,1]
            ],
            [
                [0,0],[1,0],[1,1],[2,1]
            ]
        ]
    },
    J : {
        color : "blue",
        shape : [
            [
                [0,1],[1,1],[2,0],[2,1]
            ],
            [
                [0,0],[1,0],[1,1],[1,2]
            ],
            [
                [0,0],[0,1],[1,0],[2,0]
            ],
            [
                [0,0],[0,1],[0,2],[1,2]
            ]
        ]
    },
    L : {
        color : "orange",
        shape : [
            [
                [0,0],[1,0],[2,0],[2,1]
            ],
            [
                [0,0],[0,1],[0,2],[1,0]
            ],
            [
                [0,0],[0,1],[1,1],[2,1]
            ],
            [
                [0,2],[1,0],[1,1],[1,2]
            ]
        ]
    },
    T : {
        color : "purple",
        shape : [
            [
                [0,0],[0,1],[0,2],[1,1]
            ],
            [
                [0,1],[1,0],[1,1],[2,1]
            ],
            [
                [0,1],[1,0],[1,1],[1,2]
            ],
            [
                [0,0],[1,0],[1,1],[2,0]
            ]
        ]
    },
}

// ========================= ↓↓↓↓↓↓↓↓↓↓↓↓ 게임관련 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓ =========================
// 게임 끝났는지 확인
function isGameOver(){
    for(arr of map[0]){
        if(arr.value == 2){
            gameOver();
            return false;
        }
    }
    return true;
}

// 점수 최신화
function setScore(){
    $('#tetris-score').html(score);
    $('#tetris-speed').html(speed);
}

// 게임종료
function gameOver(){
    resetGame();
    alert("게임종료");
    $(".tetris-startOrpause-btn").html("Start");
}

// 게임초기화
function resetGame(){
    score = 0;
    speed = 0;
    setScore();
    drawNextBlockArea();
    clearInterval(downInterval);
    initMap();
    drawMap();
    downY = 0;
}

// 정지 
function pauseGame(){
	closeDownInterval();
}

// 게임시작
function startGame(){
	isGaming = true;
    setBlock();
    drawMap();
    downIntervalStart(downLevel);
}

// ========================= ↓↓↓↓↓↓↓↓↓↓↓↓ 그리기 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓ =========================
// 테트리스 그리기
function drawMap(){
    for( y = 0 ; y <mapY; y++){
        for( x = 0; x < mapX ; x++){
            if(map[y][x].value == 0){
                //ctx.fillStyle = "rgb(51, 51, 51)";
                ctx.fillStyle = "black";
            }else{
                ctx.fillStyle = map[y][x].color;
            }

            ctx.fillRect(
                x * blockSize + borderWidth * x,
                y * blockSize + borderWidth * y,
                blockSize,
                blockSize
            );
        }
    }
}

// 다음블럭보여주는 영역 그리기
function drawNextBlockArea(){
    blockCtx.fillStyle = "white";
    blockCtx.fillRect(
        10,
		35,
		60,
		283
    )
    
    //rgb(68, 68, 68)
    blockCtx.fillStyle = "rgb(68, 68, 68)"
	blockCtx.strokeRect(
		10,
		35,
		60,
		283
	)
}

// 다음블럭 그리기
function updateNextBlockArea(){
	let blockWidth = getBlockWidth() + 1;
	blockWidth % 2 != 0 ?  blockWidth / 2 + 1 : blockWidth / 2;
    for(let i = 0 ; i<randomBlockList.length; i++){
        blockCtx.fillStyle = randomBlockList[i]["color"];
        for(let arr of randomBlockList[i]["shape"][0]){
            blockCtx.fillRect(
                15 + (arr[1] * 10) + (arr[1] * 6),
                40 + (i * 70) + (arr[0] * 10) + (arr[0] * 6),
                15,
                15
            )
        }
    }
}


// ========================= ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 기능 함수들 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ =========================

// 좌우 블럭 체크
function rightOrLeftCheck(){
    for(let arr of shape["shape"][locateNum]){
        if(map[arr[0] + downY][arr[1]+startX].value == 2){
            return false;
        }
    }
    return true;
}

// 현재블럭의 높이를 가져오기 ex) 높이가 2 이면 1 반환
function getBlockHeight(){
	let shapeHeight = 0;
    shape["shape"][locateNum].forEach(arr => {
        if(shapeHeight < arr[0]){
            shapeHeight = arr[0];
        }
    });
    return shapeHeight;
}

// 현재블럭의 가로길이 가져오기 ex) 길이가 3이면 2 , 길이가 1 이면 0 을 반환함
function getBlockWidth(){
	let maxX = 0;
    shape["shape"][locateNum].forEach(arr => {
        if(maxX < arr[1]){
            maxX = arr[1];
        }
    });
    return maxX;
}

// interval 종료
function closeDownInterval(){
    clearInterval(downInterval);
}

// interval 시작
function downIntervalStart(s){
    downInterval = setInterval(()=>{
        downBlock();
        drawMap();
    },s)
}


// 맵, 블럭 초기화
function initMap(){
    map = new Array(mapY);
    for(let i = 0; i<map.length; i++){
        map[i] = new Array(mapX);
        for(let j = 0 ; j < map[i].length; j++){
            map[i][j] = new Object();
            map[i][j].value = 0;
            map[i][j].color = "";
        }
    }

    let keys = Object.keys(blocks);
    for(let i =0 ; i<randomBlockList.length; i++){
        let ranNum = Math.floor(Math.random() * keys.length);
        randomBlockList[i] = blocks[keys[ranNum]];
    }
}


// 새로운 블럭 설정하기
function setBlock(){
    shape = randomBlockList.shift();

    locateNum = 0;
    startX = 5;
    downY = 0;

    let arr = Object.keys(blocks);
    let randomNum = Math.floor(Math.random() * arr.length);
    randomBlockList.push(blocks[arr[randomNum]]);

	drawNextBlockArea();
    updateNextBlockArea();
    addBlockAtMap(downY,startX);
}

// 맵에서 기존 블럭 삭제하기
function deleteBlockAtMap(y,x){
    shape["shape"][locateNum].forEach(arr=>{
        map[arr[0] + y][arr[1] + x].value = 0;
        map[arr[0] + y][arr[1] + x].color = "";
    })
}



// 블럭내리기
function downBlock(){
    downY +=1;
    if(downCheck()){
        deleteBlockAtMap(downY-1,startX);
        addBlockAtMap(downY,startX);
    }else{
        downY -= 1;
        shape["shape"][locateNum].forEach(arr=>{
            map[arr[0] + downY][arr[1] + startX].value = 2;
            map[arr[0] + downY][arr[1] + startX].color = shape["color"];
        })
        // 점수계산
        findCompletedRow();
        // 게임종료 확인
        if(isGameOver()){
            // 블럭새로 뽑기
            setBlock();
        }
    }
}


// 블럭 쭉 내리기
function straightDown(){
    deleteBlockAtMap(downY,startX);
    while(true){
        downY += 1;
        if(!downCheck()){
            downY -= 1;
            shape["shape"][locateNum].forEach(arr=>{
                map[arr[0] + downY][arr[1] + startX].value = 2;
                map[arr[0] + downY][arr[1] + startX].color = shape["color"];
            })
            // 점수계산
            findCompletedRow();
            // 게임종료 확인
            if(isGameOver()){
                // 블럭새로 뽑기
                setBlock();
            }
            break;
        }
    }
}

// 내려갈수있는지 
function downCheck(){
    let shapeHeight = getBlockHeight();

    // 바닥에 닿으면.
    if(downY + shapeHeight >= mapY){
        return false;
    }

    // 아래에 블럭이있으면
    for(let arr of shape["shape"][locateNum]){
        if(map[arr[0] + downY][arr[1] + startX].value == 2){
            // tmp = true;
            return false;
        }
    }
    return true;
}

// 한줄 완성됐는지 확인
function findCompletedRow(){
    let comleteCount = 0;
    for(let y = mapY-1; y >= 1; y--){
        let checkCount = 0;
        for(let x = 0; x < mapX; x ++){
            if(map[y][x].value == 2){
                checkCount += 1;
            }
        }
        
        if(checkCount == mapX){
            comleteCount += 1;
            for(let ty = y; ty >=1; ty--){
                for(let x = 0; x < mapX; x ++){
                    if(map[ty-1][x].value != 1){
						map[ty][x] = Object.assign({},map[ty-1][x]);
                        /*let pasteVal = map[ty-1][x].value;
                        let pasteColor = map[ty-1][x].color;
                        map[ty][x].value = pasteVal;
                        map[ty][x].color = pasteColor;*/
                    }
                }
            }
            //y = y + 1;
            y += 1;
        }
    }
    if(comleteCount != 0){
	    score = score + (comleteCount * 50);
	    speed += comleteCount;
	    setScore();
        closeDownInterval();
        downLevel = downLevel * 0.97;
        downIntervalStart(downLevel);
    }
}
// 새로 바뀐 블럭의 위치나 모양, 또는 새로운블럭을 맵에 추가하기
function addBlockAtMap(y,x){
    shape["shape"][locateNum].forEach(arr=>{
        map[arr[0] + y][arr[1] + x].value = 1;
        map[arr[0] + y][arr[1] + x].color = shape["color"];
    })
}

// ========================= ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 이동,회전 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ =========================

// 오른쪽이동
function moveRight(){
    let maxX = getBlockWidth();
    if(startX + maxX == mapX - 1){
        return;
    }
    startX += 1;
    if(!rightOrLeftCheck()){
        startX -= 1;
        return;
    }else{
        startX -= 1;
        deleteBlockAtMap(downY,startX);
    }
    startX += 1;
    addBlockAtMap(downY,startX);
}

// 왼쪽이동
function moveLeft(){
    if(startX== 0){
        return;
    }
    startX -= 1;
    if(!rightOrLeftCheck()){
        startX += 1;
        return;
    }else{
        startX += 1;
        deleteBlockAtMap(downY,startX);
    }
    startX -= 1;
    addBlockAtMap(downY,startX);
}

// 회전
function locateBlock(){
    // 전 모양을 map에서 지움
    deleteBlockAtMap(downY,startX);

    let prevLocateNum = locateNum;
    let prevX = startX;
    if(locateNum + 1 >= shape["shape"].length){
        locateNum = 0;
    }else{
        locateNum += 1;
    }

    // 오른쪽벽에 붙은상태로 회전할 시 맵밖으로 나감
    // 회전된 모양을 가져와서 가로길이를 구함
    let blockLength = 0; // 회전된 모양의 가로길이
    shape["shape"][locateNum].forEach(arr => {
        if(blockLength < arr[1]){
            blockLength = arr[1];
        }
    });
    // 현재 startX 의 위치에서 가로길이를 더했을때 mapX 의 길이와 같거나
    // 크면 큰만큼 startX--
    if(startX + blockLength >= mapX){
        startX = startX - (startX + blockLength - mapX + 1);
    }

    // 변경된 모양을 놓을 위치에 쌓여진 블럭이있는지
    if(!downCheck()){
        // 롤백
        locateNum = prevLocateNum;
        startX = prevX;
    }

    // 바뀐 모양을 map에 저장
    addBlockAtMap(downY,startX);


}

// ========================= ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 이벤트 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓ =========================
$(document).ready(()=>{
    $(window).on('keydown',(key)=>{
		// 게임중이 아니면 이벤트 안탐
		if(isGaming == false){
			return;
		}
		
        // 오른쪽
        if(key.keyCode == 39){
            moveRight();
        }
        // 왼쪽
        if(key.keyCode == 37){
           moveLeft();
        }
        // 아래
        if(key.code == "ArrowDown"){
            downBlock();
        }
        // 블럭회전
        if(key.code == "ArrowUp"){
            locateBlock();
        }
        // 바로내리기
        if(key.code == "Space"){
            straightDown();
        }
        drawMap();
    })
    
    // pc, 모바일 확인
    var isMobile = /Mobi/i.test(window.navigator.userAgent);

    if(isMobile){ // 모바일
		$('.tetris-controller').show();
		$('.tetris-controll-wrap').css('justify-content','space-between');
		$('.tetris-startOrpause-btn').css('width','30%');
	}
	
	/*$('.tetris-restart-btn').click(()=>{
		resetGame();
	})*/
	
	$('.tetris-startOrpause-btn').click(()=>{
		if(isGaming){
			$(".tetris-startOrpause-btn").html('resume');
			isGaming = false;
			//$('.tetris-restart-btn').show();
			pauseGame();
		}else{
			isGaming = true;
			if($(".tetris-startOrpause-btn").html() == "Start"){
				startGame();
			}else{
				downIntervalStart(downLevel);
			}
			$(".tetris-startOrpause-btn").html('pause');
			//$('.tetris-restart-btn').hide();
		}
		$(".tetris-startOrpause-btn").blur();
	})
	
	// 이동버튼
	$('.tetris-controller').click(event=>{
		if(isGaming == false){
			return;
		}
		
		let clickedId = event.target.id;
		// 아이디값이 없으면 path태그를 클릭한거임, so 부모 svg의 아이디를 가져오자
		if(!clickedId){
			clickedId = $(event.target).parent().attr('id');
		}
		
		if(clickedId.includes('left')){ // 왼쪽이동
			moveLeft();
		}else if(clickedId.includes('right')){ // 오른쪽이동
			moveRight();
		}else if(clickedId.includes('locate')){ // 회전
			locateBlock();
		}else if(clickedId.includes('down')){ // 내리기
			downBlock();
		}
		drawMap();
	})
})
setScore();
initMap();
drawMap();
drawNextBlockArea();