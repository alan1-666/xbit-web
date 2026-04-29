import React from 'react';
import { isNil } from 'lodash';

interface IProps {
  dates: IDate[];
  handleClick: (_: any) => void;
  value?: string;
  isDayMode?: boolean;
}

export interface IDate {
  label: string;
  value: string;
}

const ColumnTimePick = ({ dates, handleClick, value, isDayMode }: IProps) => {
  const myRef = React.useRef<HTMLDivElement>(null);
  const [blur1, setBlur1] = React.useState<string[]>([]);
  const [blur2, setBlur2] = React.useState<string[]>([]);

  React.useEffect(() => {
    handleScroll();
  }, [myRef.current]);

  React.useEffect(() => {
    scrollIntoView();
  }, [isDayMode]);

  React.useEffect(() => {
    scrollIntoView(true);
  }, [value]);

  const scrollIntoView = (isSmooth?: boolean) => {
    const indx = dates.findIndex((date) => value === date.value);
    if (!isNil(indx) && myRef?.current && myRef.current?.childNodes[indx]) {
      (myRef.current.childNodes[indx] as HTMLElement).scrollIntoView({
        block: 'center',
        ...(isSmooth ? { behavior: 'smooth' } : {}),
      });
    }
  };

  const WIDTH_CENTER = 62;
  const WIDTH_LV1 = 62;
  const WIDTH_LV2 = 62;
  const topY = window.innerHeight - 375 / 2 - WIDTH_CENTER / 2;

  const handleScroll = () => {
    const tempArr1: any = [];
    const tempArr2: any = [];

    const childTopArr = [];
    (myRef?.current?.childNodes || []).forEach((child, childIndx) => {
      const childTop = (child as HTMLElement).getBoundingClientRect().top;
      childTopArr.push(childTop);

      if (
        (childTop <= topY && childTop > topY - WIDTH_LV1) ||
        (childTop > topY + WIDTH_CENTER && childTop < topY + WIDTH_CENTER + WIDTH_LV1)
      ) {
        tempArr1.push(`${childIndx}`);
      }
      if (childTop < topY - WIDTH_LV1 || childTop + WIDTH_LV2 > topY + WIDTH_CENTER + WIDTH_LV1) {
        tempArr2.push(`${childIndx}`);
      }
    });
    setBlur1(tempArr1);
    setBlur2(tempArr2);
  };

  const getColor = (indx: number) => {
    if (blur1.includes(`${indx}`)) {
      return '#7a7a81';
    }
    if (blur2.includes(`${indx}`)) {
      return '#4e4e54';
    }

    return '#efefef';
  };

  const getHeight = (indx: number) => {
    if (blur1.includes(`${indx}`)) {
      return `${WIDTH_LV1}px`;
    }
    if (blur2.includes(`${indx}`)) {
      return `${WIDTH_LV2}px`; // min
    }

    return `${WIDTH_CENTER}px`; // center
  };

  React.useEffect(() => {
    handleScroll();
    const refCurrent = myRef.current;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      refCurrent?.scrollBy(0, e.deltaY);
      handleScroll();
    };

    let startY = 0;
    let scrollTop = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].pageY;
      scrollTop = refCurrent?.scrollTop || 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = startY - e.touches[0].pageY;
      refCurrent?.scrollTo(0, scrollTop + deltaY);
      handleScroll();
    };

    // Add event listeners
    refCurrent?.addEventListener('wheel', handleWheel);
    refCurrent?.addEventListener('touchstart', handleTouchStart);
    refCurrent?.addEventListener('touchmove', handleTouchMove);

    // Cleanup event listeners on unmount
    return () => {
      refCurrent?.removeEventListener('wheel', handleWheel);
      refCurrent?.removeEventListener('touchstart', handleTouchStart);
      refCurrent?.removeEventListener('touchmove', handleTouchMove);
    };
  }, [myRef.current]);

  return (
    <div
      ref={myRef}
      className="flex-1 flex flex-col max-h-[300px] overflow-y-auto scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      onScroll={handleScroll}
    >
      {dates.map((date, dateIndx) => {
        const isSelected = value === date.value;
        
        return (
          <div
            key={date.value}
            className="flex justify-center items-center p-5 cursor-pointer leading-tight"
            style={{
              height: getHeight(dateIndx),
              color: isSelected ? '#efefef' : getColor(dateIndx),
              backgroundColor: isSelected ? '#26262a' : 'transparent',
              fontWeight: isSelected ? 500 : 300,
              fontSize: '16px',
            }}
            onClick={() => handleClick(date.value)}
          >
            {date.label}
          </div>
        );
      })}
      <div className="py-[100px] text-[#efefef]" />
    </div>
  );
};

export default ColumnTimePick;