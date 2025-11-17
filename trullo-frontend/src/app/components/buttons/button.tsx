import styles from 'styles.module.css';

type ButtonTypes = {
  func: () => void
}

 const button = (props: ButtonTypes) => {
    return (
        <button className={styles.btn} onClick={props.func}></button>
    )
}

export default button