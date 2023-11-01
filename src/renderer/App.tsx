import { MemoryRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './LogIn';
import ChangeFolder from './ChangeFolder';
import FileHistory from './FileHistory';
import { Button, ChakraProvider, Container, HStack, List, ListItem, VStack } from '@chakra-ui/react';

export default function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="ChangeFolder" element={<ChangeFolder />} />
          <Route path="FileHistory" element={<FileHistory />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}
