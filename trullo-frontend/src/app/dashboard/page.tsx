'use client'
import React, { useEffect, useState } from 'react'
import styles from './styles.module.css'
import Card from '../components/card/card'
import Logout from '../components/logout/logout'
import TaskModal from '../components/modals/taskModal'
import { useTasksStore, Task } from '../zustand/tasksStore';
import { useUsersStore } from '../zustand/usersStore';

const dashboard = () => {
    const { tasks, loading, error, fetchTasks, updateTask, addTask, deleteTask } = useTasksStore();
    const { fetchUsers } = useUsersStore();
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, [fetchTasks, fetchUsers]);

    const handleDragStart = (task: Task) => {
        setDraggedTask(task);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        if (!target.classList.contains(styles.dragOver)) {
            target.classList.add(styles.dragOver);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            target.classList.remove(styles.dragOver);
        }
    };

    const handleDrop = async (e: React.DragEvent, newStatus: 'to-do' | 'in progress' | 'blocked' | 'done') => {
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.currentTarget as HTMLElement;
        target.classList.remove(styles.dragOver);
        const column = target.closest(`.${styles.column}`) as HTMLElement;
        if (column) {
            column.classList.remove(styles.dragOver);
        }

        if (!draggedTask || draggedTask.status === newStatus) {
            setDraggedTask(null);
            return;
        }

        try {
            await updateTask(draggedTask._id, { 
                status: newStatus
            });
            setDraggedTask(null);
        } catch (error) {
            console.error('Error updating task status - Full error:', error);
            let errorMessage = 'Unknown error';
            
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error: Could not reach server. Please check:\n1. Backend server is running\n2. You are logged in (cookies are working)\n3. CORS is configured correctly';
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            alert(`Failed to update task status:\n${errorMessage}`);
            setDraggedTask(null);
        }
    };

    const tasksByStatus = {
        'to-do': tasks.filter((task: Task) => task.status === 'to-do'),
        'in progress': tasks.filter((task: Task) => task.status === 'in progress'),
        'blocked': tasks.filter((task: Task) => task.status === 'blocked'),
        'done': tasks.filter((task: Task) => task.status === 'done'),
    };

    const statusLabels: { [key: string]: string } = {
        'to-do': 'To Do',
        'in progress': 'In Progress',
        'blocked': 'Blocked',
        'done': 'Done',
    };

    const handleOpenCreateModal = () => {
        setEditingTask(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (task: Task) => {
        setEditingTask(task);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleSubmitTask = async (data: {
        title: string;
        description: string;
        status: 'to-do' | 'in progress' | 'blocked' | 'done';
        assignedTo: string[];
    }) => {
        if (modalMode === 'create') {
            await addTask(data);
        } else if (editingTask) {
            await updateTask(editingTask._id, data);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask(taskId);
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task');
        }
    };

    if (loading) {
        return (
            <div className={styles.mainContainer}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Dashboard</h1>
                    <Logout />
                </header>
                <div className={styles.loading}>Loading tasks...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.mainContainer}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Dashboard</h1>
                    <Logout />
                </header>
                <div className={styles.error}>Error: {error}</div>
            </div>
        );
    }

    return (
        <div className={styles.mainContainer}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Dashboard</h1>
                    <button className={styles.addButton} onClick={handleOpenCreateModal}>
                        + Add Task
                    </button>
                </div>
                <Logout />
            </header>
            <div className={styles.board}>
                {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                    <div 
                        key={status} 
                        className={styles.column}
                        data-status={status}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, status as 'to-do' | 'in progress' | 'blocked' | 'done')}
                    >
                        <h2 className={styles.columnTitle}>
                            {statusLabels[status]}
                            <span className={styles.count}>{statusTasks.length}</span>
                        </h2>
                        <div 
                            className={styles.cardsContainer}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, status as 'to-do' | 'in progress' | 'blocked' | 'done')}
                        >
                            {statusTasks.length === 0 ? (
                                <p className={styles.emptyMessage}>No tasks</p>
                            ) : (
                                statusTasks.map((task: Task) => (
                                    <Card
                                        key={task._id}
                                        task={task}
                                        onDragStart={() => handleDragStart(task)}
                                        onEdit={handleOpenEditModal}
                                        onDelete={handleDeleteTask}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <TaskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitTask}
                task={editingTask}
                mode={modalMode}
            />
        </div>
    );
}

export default dashboard