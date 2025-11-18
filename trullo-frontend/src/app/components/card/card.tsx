'use client'
import styles from './styles.module.css';
import { Task } from '../../zustand/tasksStore';
import { useUsersStore } from '../../zustand/usersStore';

type CardType = {
  task: Task;
  onDragStart: () => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const Card = (props: CardType) => {
    const { task, onDragStart, onTouchStart, onEdit, onDelete } = props;
    const { getUserById } = useUsersStore();
    
    // Handle both array and single string (for backwards compatibility)
    const assignedToArray = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
    const assignedUsers = assignedToArray
        .map(userId => getUserById(userId))
        .filter(user => user !== undefined);
    
    const assignedNames = assignedUsers.length > 0
        ? assignedUsers.map(user => user!.name).join(', ')
        : assignedToArray.join(', ');

    const handleDragStart = (e: React.DragEvent) => {
        onDragStart();
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task._id);
        // Add visual feedback
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent) => {
        // Restore visual feedback
        const target = e.currentTarget as HTMLElement;
        target.style.opacity = '1';
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(task);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this task?')) {
            onDelete(task._id);
        }
    };

    return (
        <div 
            className={styles.cardContainer}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onTouchStart={onTouchStart}
        >
           <div className={styles.cardHeader}>
               <h3 className={styles.cardTitle}>{task.title}</h3>
               <div className={styles.cardActions}>
                   <button 
                       className={styles.editButton}
                       onClick={handleEdit}
                       title="Edit task"
                   >
                       ✏️
                   </button>
                   <button 
                       className={styles.deleteButton}
                       onClick={handleDelete}
                       title="Delete task"
                   >
                       🗑️
                   </button>
               </div>
           </div>
           <p className={styles.cardDescription}>{task.description}</p>
           <p className={styles.assignedTo}>
               Assigned to: {assignedNames} {assignedToArray.length > 1 && `(${assignedToArray.length} users)`}
           </p>
        </div>
    )
}

export default Card