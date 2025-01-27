'use client';
import { useDrag } from 'react-dnd';

export default function DraggableTable({ table, onMove, onClick }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'table',
    item: { id: table.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        const { x, y } = dropResult;
        onMove(table.id, x, y);
      }
    },
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'EMPTY':
        return 'bg-green-500';
      case 'RESERVED':
        return 'bg-yellow-500';
      case 'OCCUPIED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      ref={drag}
      className={`absolute cursor-move ${isDragging ? 'opacity-50' : ''}`}
      style={{
        left: table.positionX,
        top: table.positionY,
        width: '100px',
        height: '100px',
      }}
      onClick={onClick}
    >
      <div
        className={`w-full h-full rounded-full ${getStatusColor(
          table.status
        )} flex items-center justify-center text-white font-bold border-4 border-white shadow-lg`}
      >
        <div className="text-center">
          <div>{table.number}</div>
          <div className="text-xs">{table.capacity} Kişilik</div>
        </div>
      </div>
    </div>
  );
} 