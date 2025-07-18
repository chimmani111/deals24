
import React, { memo } from 'react';
import { format } from 'date-fns';
import { Heart, Share2, Trash2, ExternalLink } from 'lucide-react';
import CachedTelegramImage from '../images/CachedTelegramImage';
import { handleTrackedLinkClick } from '../../services/api';
import { extractFirstLink, extractSecondLink } from '../deal/utils/linkUtils';

interface FavoriteItem {
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
  telegramFileId?: string;
  id?: string;
  timestamp: string;
  createdAt?: string;
}

interface WishlistDealCardProps {
  item: FavoriteItem;
  onRemove: (title: string) => void;
  onViewDetails: (item: FavoriteItem) => void;
  onViewFullPage: (item: FavoriteItem) => void;
  onShare: (item: FavoriteItem) => void;
  formatDate: (dateString: string) => string;
}

const WishlistDealCard = memo(({
  item,
  onRemove,
  onViewDetails,
  onViewFullPage,
  onShare,
  formatDate,
}: WishlistDealCardProps) => {
  const createdDate = item.createdAt ? format(new Date(item.createdAt), 'h:mm a, MMM d, yyyy') : null;

  const handleLinkClick = (url: string, e: React.MouseEvent) => {
    handleTrackedLinkClick(url, item.id, e.nativeEvent);

    if (e.ctrlKey || e.metaKey || e.button === 1) return;

    e.preventDefault();
    e.stopPropagation();

    setTimeout(() => {
      window.open(url, '_blank');
    }, 100);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(item.title);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(item);
  };

  const handleViewFullPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewFullPage(item);
  };

  const primaryLink = item.link || extractSecondLink(item.description) || extractFirstLink(item.description) || '#';

  const renderImage = () => {
    if (item.imageUrl) {
      return (
        <img 
          src={item.imageUrl} 
          alt={item.title}
          className="w-full h-40 object-contain rounded-lg"
          loading="lazy"
          onError={(e) => {
            console.error('Failed to load Amazon image:', item.imageUrl);
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    } else if (item.telegramFileId) {
      return (
        <CachedTelegramImage
          telegramFileId={item.telegramFileId}
          alt={item.title}
          className="w-full h-40 rounded-lg"
        />
      );
    }
    return null;
  };

  const hasImage = item.imageUrl || item.telegramFileId;

  return (
    <div
      className="group animate-fade-up hover-scale cursor-pointer h-[450px]"
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey || e.button === 1) return;
        onViewDetails(item);
      }}>
      <div className="relative glass-effect rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] h-full flex flex-col border-gray-200 dark:border-gray-900 dark:bg-zinc-950">
        {/* Action buttons */}
        <div className="mt-2 absolute top-3 right-3 flex items-center gap-1 z-10">
          {item.id && (
            <button
              onClick={handleViewFullPage}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
              title="Visit full page">
              <ExternalLink className="w-4 h-4 text-green-500" />
            </button>
          )}
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
            title="Share deal">
            <Share2 className="w-4 h-4 text-blue-500" />
          </button>
          <button
            onClick={handleRemove}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
            title="Remove from wishlist">
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 flex-1 flex flex-col min-h-0">
          <div className="space-y-2 flex-shrink-0">
            {/* Created date - normal date without prefix */}
            {createdDate && (
              <span className="time-badge text-xs opacity-75">
                {createdDate}
              </span>
            )}
            <h3 className="text-lg font-semibold text-high-contrast line-clamp-2 leading-tight pr-24">
              {item.title}
            </h3>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            {hasImage && (
              <div className="flex-1 flex items-center justify-center">
                {renderImage()}
              </div>
            )}
          </div>
        </div>

        {/* Buy Now Button */}
        <div className="mt-auto pt-3 flex-shrink-0">
          <a
            href={primaryLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => handleLinkClick(primaryLink, e)}
            className="inline-block w-full text-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-b from-apple-darkGray to-indigo-950 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-apple-darkGray/20 flex items-center justify-center hover:scale-105"
          >
            Buy Now
          </a>
        </div>

        {/* Wishlisted date at the bottom */}
        <div className="mt-2 flex-shrink-0">
          <span className="time-badge text-xs">
            {'❤️->'} {format(new Date(item.timestamp), 'h:mm a, MMM d, yyyy')}
          </span>
        </div>
      </div>
    </div>
  );
});

export default WishlistDealCard;
