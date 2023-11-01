import { Container, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

const FileHistory = () => {
  const navigate = useNavigate();
  return (
    <>
      <Header navigate={navigate} />
      <Container paddingTop={'10%'}>
        <Heading>File History</Heading>
      </Container>
    </>
  );
}

export default FileHistory;