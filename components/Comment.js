import { Flex, Text } from '@aws-amplify/ui-react';
import styles from '../styles/comment.module.css';
function Comment({ message, username, ...props }) {
  return (
    <Flex className={styles.commentBox} {...props} borderRadius="large" backgroundColor="#25392B">
      <Text color="white"><strong>{username}</strong>: {message}</Text>
    </Flex>
  );
}

export default Comment;
