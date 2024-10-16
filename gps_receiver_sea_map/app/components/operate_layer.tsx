import styles from '../styles/operate_layer.module.css';

const OperateLayer = () => {
    return(
        <div className={styles.operateLayerContainer}>
            <button className={`${styles.button} ${styles.test}`}> 어라랍스타 </button>
        </div>
    )
}

export default OperateLayer