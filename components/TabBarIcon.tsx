import FontAwesome from '@expo/vector-icons/FontAwesome';
import { MotiView } from 'moti';
import { StyleSheet } from 'react-native';

export const TabBarIcon = (props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  size?: number;
}) => {
  const { size = 28, ...restProps } = props;

  return (
    <MotiView
      animate={{
        scale: props.color === '#14b8a1' ? 1 : 1,
      }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 300,
      }}>
      <FontAwesome size={size} style={styles.tabBarIcon} {...restProps} />
    </MotiView>
  );
};

export const styles = StyleSheet.create({
  tabBarIcon: {
    marginBottom: -3,
  },
});
