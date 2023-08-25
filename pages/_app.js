import "../styles/globals.css";
import '@aws-amplify/ui-react/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import { Flex } from '@aws-amplify/ui-react';
import Header from "../components/Header";
import { ToastContainer } from 'react-toastify';

function MyApp({ Component, pageProps }) {
  return (
    <Flex direction="column" width="100%">
      <Header />
      <Component {...pageProps} />
      <ToastContainer />
    </Flex>
  );
}

export default MyApp;