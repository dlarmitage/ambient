import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ProjectCard from './ProjectCard';

const SortableProjectCard = ({ project, onDelete, onEdit }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: project.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'grab', // Indicate draggable
        position: 'relative',
        touchAction: 'none' // Important for touch devices
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <ProjectCard
                project={project}
                isAdmin={true}
                onDelete={onDelete}
                onClick={() => onEdit(project)}
            />
        </div>
    );
};

export default SortableProjectCard;
