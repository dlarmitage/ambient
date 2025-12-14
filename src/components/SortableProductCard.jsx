import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ProductCard from './ProductCard';

const SortableProductCard = ({ product, onDelete, onEdit }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: product.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'grab', // Indicate draggable
        position: 'relative',
        touchAction: 'none' // Important for touch devices
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <ProductCard
                product={product}
                isAdmin={true}
                onDelete={onDelete}
                onClick={() => onEdit(product)}
            />
        </div>
    );
};

export default SortableProductCard;
