function socketController(io, Square, Room){
    io.on('connection' , function(socket){

        socket.on('joinRoom', function(data){
            socket.join(data.roomName);
        });

        socket.on('loadSquares' , function(data){
          var roomName = data.roomName;
          Room.findOne({name:roomName}, function(err,room){
              Square.find({'_id': { $in: room.squares}}, function(err,squares){
                  socket.emit('loadSquares' , {squares : squares});
              });
          });
        });

        socket.on('updateSquarePos' , function(data){
          socket.broadcast.to(data.roomName).emit('updateSquarePos', {pos : data.pos, zIndex : data.zIndex, squareId : data.squareId});
          Square.findById(data.squareId, function(err, thisSquare){
            thisSquare.pos = data.pos;
            thisSquare.zIndex = data.zIndex;
            thisSquare.save();
          });
        });

        socket.on('updateSquareSize' , function(data){
          socket.broadcast.to(data.roomName).emit('updateSquareSize', {width : data.width, height : data.height, squareId : data.squareId});
          Square.findById(data.squareId, function(err, thisSquare){
            thisSquare.width = data.width;
            thisSquare.height = data.height;
            thisSquare.save();
          });
        });

        socket.on('updateSquareColor' , function(data){
          socket.broadcast.to(data.roomName).emit('updateSquareColor' , {color : data.color, squareId : data.squareId});
          Square.findById(data.squareId, function(err, thisSquare){
            thisSquare.color = data.color;
            thisSquare.save();
          });
        });

        socket.on('updateSquareText' , function(data){
          socket.broadcast.to(data.roomName).emit('updateSquareText' , {text : data.text , squareId : data.squareId});
          Square.findById(data.squareId, function(err, thisSquare){
            thisSquare.text = data.text;
            thisSquare.save();
          });
        });

        socket.on('newSquare', function(data){
          var newSquare = new Square;
          newSquare.owner = data.user;
          newSquare.pos = {top : (data.mouseY - 50), left : (data.mouseX - 50)};
          newSquare.save(function(err, thisSquare){
            Room.findOne({name:data.roomName}, function(err, room){
                room.squares.push(thisSquare._id);
                room.save();
                io.sockets.in(data.roomName).emit('newSquare' , {user : data.user, squareId : thisSquare._id});
            });
          });
        });

        socket.on('deleteSquare' , function(data){
          socket.broadcast.to(data.roomName).emit('deleteSquare', {squareId : data.squareId});
          Square.findByIdAndRemove(data.squareId, function(err){
            if(err) console.log(err);
            Room.findOne({name : data.roomName}, function(err,room){
                squareIndex = room.squares.indexOf(data.squareId);
                room.squares.splice(squareIndex,1);
                room.save();
            })
          });
        });

    });
}

module.exports = {socketController};
