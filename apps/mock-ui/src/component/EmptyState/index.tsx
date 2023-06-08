
import styles from './index.module.css';

const EmptyState: React.FC<any> = () => {

    return (
        <div className={styles.container}>
            <p>You have no new requests</p>
        </div>
    )
}

export default EmptyState;