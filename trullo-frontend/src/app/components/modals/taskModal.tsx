'use client'
import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import styles from './taskModal.module.css';
import { Task } from '../../zustand/tasksStore';
import { useUsersStore } from '../../zustand/usersStore';

interface TaskFormData {
  title: string;
  description: string;
  status: 'to-do' | 'in progress' | 'blocked' | 'done';
  assignedTo: string[];
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  task?: Task | null;
  mode: 'create' | 'edit';
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, task, mode }) => {
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<TaskFormData>();
  const { users, fetchUsers, loading: usersLoading } = useUsersStore();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && task) {
        const assignedToArray = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
        setSelectedUsers(assignedToArray);
        reset({
          title: task.title,
          description: task.description,
          status: task.status,
          assignedTo: assignedToArray
        });
      } else {
        setSelectedUsers([]);
        reset({
          title: '',
          description: '',
          status: 'to-do',
          assignedTo: []
        });
      }
    }
  }, [isOpen, task, mode, reset]);

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => {
      const newSelection = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      // Update form value
      reset({ ...watch(), assignedTo: newSelection });
      return newSelection;
    });
  };

  if (!isOpen) return null;

  const onFormSubmit: SubmitHandler<TaskFormData> = async (data) => {
    try {
      // Ensure assignedTo is always an array
      const submitData = {
        ...data,
        assignedTo: Array.isArray(data.assignedTo) ? data.assignedTo : [data.assignedTo]
      };
      
      if (submitData.assignedTo.length === 0) {
        alert('Please select at least one user');
        return;
      }
      
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{mode === 'create' ? 'Create New Task' : 'Edit Task'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Title *
            </label>
            <input
              type="text"
              id="title"
              className={styles.input}
              placeholder="Enter task title"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <span className={styles.error}>{errors.title.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description *
            </label>
            <textarea
              id="description"
              className={styles.textarea}
              rows={4}
              placeholder="Enter task description"
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <span className={styles.error}>{errors.description.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status" className={styles.label}>
              Status *
            </label>
            <select
              id="status"
              className={styles.select}
              {...register('status', { required: 'Status is required' })}
            >
              <option value="to-do">To Do</option>
              <option value="in progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>
            {errors.status && (
              <span className={styles.error}>{errors.status.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Assigned To * {selectedUsers.length > 0 && `(${selectedUsers.length} selected)`}
            </label>
            {usersLoading ? (
              <div className={styles.loadingText}>Loading users...</div>
            ) : (
              <div className={styles.userCheckboxList}>
                {users.map((user) => (
                  <label key={user._id} className={styles.userCheckbox}>
                    <input
                      type="checkbox"
                      value={user._id}
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleUserToggle(user._id)}
                    />
                    <span>{user.name} ({user.email})</span>
                  </label>
                ))}
              </div>
            )}
            {errors.assignedTo && (
              <span className={styles.error}>{errors.assignedTo.message}</span>
            )}
            {selectedUsers.length === 0 && !usersLoading && (
              <span className={styles.error}>Please select at least one user</span>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              {mode === 'create' ? 'Create Task' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

