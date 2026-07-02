
import React from 'react';
import { format } from 'date-fns';
import DealImage from '../images/DealImage';

interface DealCardContentProps {
  title: string;
  description: string;
  createdAt?: string;
  category?: string;
  imageUrl?: string;
  telegramFileId?: string;
}

const DealCardContent = ({ title, description, createdAt, category, imageUrl, telegramFileId }: DealCardContentProps) => {
  const formattedDate = createdAt
    ? format(new Date(createdAt), 'h:mm a-MMM-d-yy')
    : '';

  return (
    <div className="space-y-3 flex-1 flex flex-col min-h-0">
      <div className="space-y-2 flex-shrink-0">
        {formattedDate && (
          <div className="flex items-center">
            <span className="time-badge py-1 text-[10px]">
              {formattedDate}
            </span>
          </div>
        )}
        <h3 className="text-lg font-semibold text-high-contrast line-clamp-2 leading-tight pr-20">
          {title}
        </h3>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="mb-3 flex-shrink-0">
          <DealImage
            title={title}
            category={category}
            imageUrl={imageUrl}
            telegramFileId={telegramFileId}
            className="w-full h-40 object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default DealCardContent;
