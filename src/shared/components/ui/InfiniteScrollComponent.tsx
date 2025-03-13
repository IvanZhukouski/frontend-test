import { cn } from '@/shared/lib';
import { FC, ReactNode } from 'react';
import { Props as InfiniteScrollProps } from 'react-infinite-scroll-component';
import InfiniteScroll from 'react-infinite-scroll-component';

interface IInfiniteScrollComponentProps extends InfiniteScrollProps {
  slots?: {
    top: ReactNode;
    bottom: ReactNode;
  };
}
export const InfiniteScrollComponent: FC<
  IInfiniteScrollComponentProps
> = props => {
  const { slots } = props;

  return (
    // added height equal to body inner height
    // to make infinite scroll height maximum available
    <div className="flex flex-col gap-8 w-full h-full">
      {slots?.top}
      <div
        className={cn([
          'flex-1 min-h-0',
          { ['[&>div]:h-full']: props.dataLength > 0 },
        ])}
      >
        <InfiniteScroll {...props} />
        {slots?.bottom}
      </div>
    </div>
  );
};
