//const socket = io();

//socket.emit("churan");
document.addEventListener("DOMContentLoaded", () => {
const socket = io();
socket.emit("setUsername", USERNAME_FROM_EJS); 
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

//setting the board for the game from scracth
const renderBoard = ()=>{
    const board = chess.board();
    //to avoid errors so that nothing comes in the board by mistake also 
    //boardElement.innerHTML ="";
    if (boardElement) {
    boardElement.innerHTML = "";
    }
    board.forEach((row,rowindex)=>{
        row.forEach((square,squareindex)=>{
            const squareElement =document.createElement("div");
            squareElement.classList.add("square", 
                (rowindex + squareindex)%2 === 0?"light" :"dark"
            );

            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            if(square){
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", 
                    square.color==="w" ? "white" : "black"
                );
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;
                
                pieceElement.addEventListener("dragstart",(e)=>{
                    if(pieceElement.draggable){
                        draggedPiece = pieceElement;
                        sourceSquare={row:rowindex, col:squareindex};
                       //the line below is a neccesity for the drag and drop functionality 

                        e.dataTransfer.setData("text/plain","");
                    }
                });
                pieceElement.addEventListener("dragend",(e)=>{
                    draggedPiece = null;
                    sourceSquare = null;
                });
                squareElement.appendChild(pieceElement);
            }
            squareElement.addEventListener("dragover",function(e){
                e.preventDefault();
            });
            squareElement.addEventListener("drop", function(e){
                e.preventDefault();
                if(draggedPiece){
                    const targetSource = {
                        row:parseInt(squareElement.dataset.row),
                        col:parseInt(squareElement.dataset.col)
                    };
                    handleMove(sourceSquare, targetSource);
                }
            });
            boardElement.appendChild(squareElement);
        });
    

    });

    
    
};

/*const handleMove = (source, target)=>{
    const move = {
        from: `${String.fromCharCode(97+source.col)}${8-source.row}` ,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion :'q'
    };
    socket.emit("move", move);
};*/


const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q'
    };

    // Try move locally before sending to server
    const result = chess.move(move);

    if (result) {
        socket.emit("move", move); // send only if valid
        renderBoard(); // update local board view
    } else {
        console.warn("Invalid move attempted:", move);
        // Optionally show a message to the user
    }
};


const getPieceUnicode = (piece)=>{
    const unicodePieces = {
        p: "♟", // black pawn
        r: "♜", // black rook
        n: "♞", // black knight
        b: "♝", // black bishop
        q: "♛", // black queen
        k: "♚", // black king
        P: "♙", // white pawn
        R: "♖", // white rook
        N: "♘", // white knight
        B: "♗", // white bishop
        Q: "♕", // white queen
        K: "♔", // white king
    };

    return unicodePieces[piece.type] || "";
};

socket.on("playerRole",function(role){
    playerRole = role;
     console.log("Assigned player role:", playerRole);
    renderBoard();
});

socket.on("spectatorRole", function(){
    playerRole = null;
    renderBoard();
});

socket.on("boardState", function(fen){
    chess.load(fen); //function in chess which is imported
    renderBoard();
});

socket.on("move", function(move){
    chess.move(move);
    renderBoard();
});

renderBoard();
});
