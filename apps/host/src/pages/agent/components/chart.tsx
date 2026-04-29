import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { formatNumberWithCommas } from '@/utils/helpers';

// 自定义工具提示组件
const CustomTooltip = ({ payload, label,seriesConfig }: any) => {
  if (payload && payload.length) {
    return (
      <div className="bg-[#23232B] border border-[#9035FF30] rounded-[10px] p-2">
        <p className="text-white text-[11px] font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => {
          const config = seriesConfig.find((s:any) => s.key === entry.dataKey);
          return (
            <div key={index} className="flex items-center gap-2 text-[11px] mb-1">
              <span className="text-[#FFFFFF80]">{config?.name}:</span>
              <span className="text-white font-medium">{formatNumberWithCommas(entry.value || 0,2)}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const Chart = ({  type, title, dataSummary,chartData }: { type: string, title: string, dataSummary: any,chartData: any }) => {
  const { t } = useTranslation()
  
  // 根据数据长度计算X轴刻度间隔
  const getXAxisInterval = (dataLength: number) => {
    if (dataLength <= 7) return 0;      // 显示所有刻度
    if (dataLength <= 25) return 2;     // 每隔1个显示
    if (dataLength <= 40) return 4;     // 每隔2个显示
    if (dataLength <= 60) return 6;     // 每隔3个显示
    return 4;                           // 每隔4个显示
  }
  
  const dataLength = chartData?.length || 0;
  const xAxisInterval = getXAxisInterval(dataLength);

  const oneSeriesConfig = [
    {
      key: 'all',
      name: `累计`,
      color: '#FFC700',
      currentValue: dataSummary?.all,
      unit: '人'
    },
  ]
  const threeSeriesConfig = [
    {
      key: 'all',
      name: `${t('nodeAgent.tradingOverview.all')}(USD)`,
      color: '#FFC700',
      currentValue: dataSummary?.all,
      unit: 'USD'
    },
    {
      key: 'meme',
      name: `${t('nodeAgent.tradingOverview.meme')}(USD)`,
      color: '#C748FF',
      currentValue: dataSummary?.meme,
      unit: 'USD'
    },
    {
      key: 'contract',
      name: `${t('nodeAgent.tradingOverview.futures')}(USD)`,
      color: '#00D0FF',
      currentValue:  dataSummary?.contract,
      unit: 'USD'
    }
  ];
    
  const seriesConfig = type === 'aline' ? oneSeriesConfig : threeSeriesConfig as any;

  

  
// 动态生成 Y 轴刻度（均分6个刻度）
const getYAxisTicks = (data: any[]) => {
  if (!data || data.length === 0) return [0, 100, 200, 300, 400, 500];
  let maxValue = 0;
  if (type === 'aline') {
    maxValue = Math.max(...data.flatMap((d) => [d.value || 0]));
  } else {
    maxValue = Math.max(...data.flatMap((d) => [d.all || 0, d.meme || 0, d.contract || 0])); 
  }
  
  // 如果最大值为0，返回默认刻度
  if (maxValue === 0) return [0, 20, 40, 60, 80, 100];
  
  // 计算合适的最大值上限（向上取整到合适的数值）
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  const normalizedMax = maxValue / magnitude;
  
  let niceMax;
  if (normalizedMax <= 1) niceMax = 1;
  else if (normalizedMax <= 2) niceMax = 2;
  else if (normalizedMax <= 5) niceMax = 5;
  else niceMax = 10;
  
  const actualMax = niceMax * magnitude;
  
  // 生成6个刻度（包含0）
  const tickCount = 6;
  const step = actualMax / (tickCount - 1);
  const ticks: number[] = [];
  
  for (let i = 0; i < tickCount; i++) {
    const value = i * step;
    // 保持合理的小数位数
    ticks.push(Math.round(value * 100) / 100);
  }
  return ticks;
};
const yAxisTicks = getYAxisTicks(chartData);
  return (
    <div className="w-full bg-[#1A1A1A] rounded-[8px] py-[14px] px-[10px]">
      {/* 标题和图例 */}
      <div className="mb-4">
        <div className="flex items-center mb-4 relative">
          <div className="w-[2px] h-[12px] bg-[#00FFA7] rounded-[0px_2px_2px_0px] absolute left-[-10px] top-[50%] translate-y-[-50%]"></div>
          <h3 className="text-white text-[16px] mr-[6px]">{title}</h3>
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M7.99992 14.6667C11.6666 14.6667 14.6666 11.6667 14.6666 8C14.6666 4.33333 11.6666 1.33333 7.99992 1.33333C4.33325 1.33333 1.33325 4.33333 1.33325 8C1.33325 11.6667 4.33325 14.6667 7.99992 14.6667Z" stroke="#B9B9B9" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 5.33333V8.66667" stroke="#B9B9B9" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7.99634 10.6667H8.00233" stroke="#B9B9B9" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        
        {/* 图例 */}
        <div className="space-y-1">
          {seriesConfig.map((series: any) => (
            <div key={series.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: series.color }}
                />
                <span className="text-[#FFFFFF80] text-[14px]">{series.name}</span>
              </div>
              <div className="text-right">
                <span className="text-white  text-[14px]">
                  {formatNumberWithCommas(series.currentValue || 0,2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 图表容器 */}
      <div className="w-full h-[205px] mt-[16px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid
                // stroke="#ECECED"
                strokeWidth={0.5}
                opacity={0.12}
                vertical={false}
                // horizontalCoordinatesGenerator={(props) => {
                //  return yAxisTicks.map((value) => props.yAxis.scale(value));
                // }}
            />
            <XAxis 
              dataKey="period"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              interval={xAxisInterval}  // 根据数据密度动态调整X轴刻度间隔
            />
            <YAxis 
              domain={[0, Math.max(...yAxisTicks)]}   // 动态设置Y轴范围
              ticks={yAxisTicks}                      // 6个均分刻度
              fontSize={10}
              axisLine={false}
              tickLine={false}
              width={50}
              type="number"
              tickMargin={4}
              tickFormatter={(value) => {
                // 格式化刻度显示，去除不必要的小数点
                return value % 1 === 0 ? value.toString() : value.toFixed(1);
              }}
            />
            <Tooltip content={<CustomTooltip seriesConfig={seriesConfig} />} cursor={{ stroke: '#ECECED', strokeWidth: 0.5 ,opacity:0.12,strokeDasharray: '4 2'}} isAnimationActive={false} />
            
            {/* 数据线 */}
            {seriesConfig.map((series: any) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                stroke={series.color}
                strokeWidth={2}
                dot={(props: any) => {
                  // 根据X轴刻度显示对应的dot，并确保首尾点总是显示
                  const isFirstOrLast = props.index === 0 || props.index === dataLength - 1;
                  const isIntervalMatch = props.index % (xAxisInterval + 1) === 0;
                  const shouldShow = isFirstOrLast || isIntervalMatch;
                  
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={shouldShow ? 2 : 0}
                      fill={series.color}
                      strokeWidth={shouldShow ? 1 : 0}
                      stroke={series.color}
                      style={{ opacity: shouldShow ? 1 : 0 }}
                    />
                  );
                }}
                activeDot={{ 
                  r: 2, 
                  fill: series.color, 
                  strokeWidth: 1, 
                  stroke:series.color,
                  // filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.2))'
                }}  // 只在hover时显示点位
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Chart;