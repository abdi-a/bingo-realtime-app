import React, { useEffect, useState, useRef } from 'react';
import socket from './socket';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Alert,
  Stack
} from '@mui/material';

const BOARD = [
  [5, 18, 33, 48, 62],
  [10, 22, 37, 53, 70],
  [2, 28, 'FREE', 52, 66],
  [7, 19, 40, 57, 73],
  [12, 25, 34, 59, 75],
];

function getBoardNumbers(board) {
  return board.flat().filter(n => n !== 'FREE');
}

function App() {
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [lastNumber, setLastNumber] = useState(null);
  const [win, setWin] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [firstWinner, setFirstWinner] = useState(null);
  const nameInputRef = useRef(null);
  const hasEmittedWin = useRef(false);

  useEffect(() => {
    if (!joined) return;
    socket.on('init', ({ drawnNumbers, firstWinner }) => {
      setDrawnNumbers(drawnNumbers);
      setLastNumber(drawnNumbers[drawnNumbers.length - 1] || null);
      setFirstWinner(firstWinner || null);
    });
    socket.on('number-drawn', ({ number, drawnNumbers }) => {
      setDrawnNumbers(drawnNumbers);
      setLastNumber(number);
    });
    socket.on('restart', () => {
      setDrawnNumbers([]);
      setLastNumber(null);
      setWin(false);
      setRestarting(false);
      setFirstWinner(null);
      hasEmittedWin.current = false;
    });
    socket.on('winner', (winnerName) => {
      setFirstWinner(winnerName);
    });
    return () => {
      socket.off('init');
      socket.off('number-drawn');
      socket.off('restart');
      socket.off('winner');
    };
  }, [joined]);

  useEffect(() => {
    if (!joined) return;
    const boardNumbers = getBoardNumbers(BOARD);
    const matched = boardNumbers.filter(n => drawnNumbers.includes(n));
    if (matched.length >= 5) {
      setWin(true);
      if (!hasEmittedWin.current && !firstWinner) {
        socket.emit('bingo-win', name);
        hasEmittedWin.current = true;
      }
    }
  }, [drawnNumbers, joined, name, firstWinner]);

  const handleRestart = async () => {
    setRestarting(true);
    try {
      await fetch('http://localhost:4000/restart', { method: 'POST' });
    } catch (e) {}
    setTimeout(() => setRestarting(false), 3000);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setJoined(true);
    }
  };

  useEffect(() => {
    if (!joined && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [joined]);

  if (!joined) {
    return (
      <Box sx={{ minHeight: '100vh', minWidth: '100vw', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Realtime Bingo
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw' }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', width: '100%', maxWidth: 480 }}>
            <Typography variant="h5" gutterBottom>Enter your name to join</Typography>
            <Box component="form" onSubmit={handleJoin} sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <TextField
                inputRef={nameInputRef}
                label="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                variant="outlined"
                size="medium"
                autoFocus
              />
              <Button type="submit" variant="contained" size="medium" disabled={!name.trim()}>
                Join Game
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', minWidth: '100vw', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Realtime Bingo
          </Typography>
          <Typography variant="subtitle1" sx={{ ml: 2 }}>
            Welcome, <b>{name}</b>!
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw' }}>
        <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, width: '100%', maxWidth: 600 }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h4" color="primary" gutterBottom>
              Last Number Drawn: {lastNumber ? <b>{lastNumber}</b> : '-'}
            </Typography>
            <Box sx={{ overflowX: 'auto', mb: 2, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Table sx={{ width: { xs: 300, sm: 400, md: 500 }, maxWidth: '90vw' }}>
                <TableBody>
                  {BOARD.map((row, i) => (
                    <TableRow key={i}>
                      {row.map((num, j) => {
                        const isFree = num === 'FREE';
                        const isDrawn = drawnNumbers.includes(num);
                        return (
                          <TableCell
                            key={j}
                            align="center"
                            sx={{
                              width: { xs: 40, sm: 56 },
                              height: { xs: 40, sm: 56 },
                              bgcolor: isFree ? '#ffe082' : isDrawn ? 'success.main' : '#fff',
                              color: isDrawn ? '#fff' : '#333',
                              fontWeight: isFree ? 'bold' : 'normal',
                              fontSize: 20,
                              border: '2px solid #90caf9',
                              transition: 'background 0.3s',
                            }}
                          >
                            {num}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Button
              onClick={handleRestart}
              disabled={restarting}
              variant="contained"
              color="secondary"
              size="large"
            >
              {restarting ? 'Restarting...' : 'Restart Game'}
            </Button>
            {firstWinner && (
              <Alert severity="success" sx={{ mt: 2, fontSize: 18 }}>
                🏆 First Winner: <b>{firstWinner}</b>
              </Alert>
            )}
            {win && (
              <Alert severity="info" sx={{ mt: 2, fontSize: 22 }}>
                🎉 You Win!
              </Alert>
            )}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default App;
