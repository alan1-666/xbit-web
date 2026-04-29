import { useState, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { QRCodeCanvas } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { logEvent2, ACTIONS } from '@services/google-analytics.service'

interface InviteShareCardProps {
  inviteCode: string;
  inviteUrl: string;
}

// 暴露给父组件的方法类型
export interface InviteShareCardRef {
  handleSaveImage: () => Promise<void>;
}

const InviteShareCard = forwardRef<InviteShareCardRef, InviteShareCardProps>(({ inviteCode, inviteUrl }, ref) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const currentUrl = useMemo(() => window.location.origin, [])
  const { t } = useTranslation()

  // 暴露 handleSaveImage 方法给父组件
  useImperativeHandle(ref, () => ({
    handleSaveImage,
  }));
  // 三种不同的背景主题
  const cardThemes = [
    {
      id: 1,
      background: 'url(/images/nodeAgent/newInviteBg1.png)',
      accentColor: '#C8A7FD',
    },
    {
      id: 2,
      background: 'url(/images/nodeAgent/newInviteBg2.png)',
      accentColor: '#2FFD95',
    },
    {
      id: 3,
      background: 'url(/images/nodeAgent/newInviteBg3.png)',
      accentColor: '#FFC767',
    },
  ];

  // 复制链接
  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('inviteFriends.copySuccess'));
      logEvent2(ACTIONS.referral_copy_link)
    } catch (err) {
      toast.error('复制失败，请重试');
    }
  };

  // 保存图片
  const handleSaveImage = async () => {
    if (!sliderRef.current) return;

    // 获取当前选中的slide
    const currentSlide = sliderRef.current.querySelector('.slick-current');
    if (!currentSlide) {
      toast.error('error');
      return;
    }

    setIsGeneratingImage(true);

    try {
      // 方法1: 尝试使用html2canvas
      await saveWithHtml2Canvas(currentSlide as HTMLElement);
    } catch (err) {
      // console.warn('html2canvas failed, trying fallback method:', err);
      toast.error('html2canvas failed, trying fallback method:');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 使用html2canvas保存
  const saveWithHtml2Canvas = async (element: HTMLElement) => {
    try {
      const html2canvas = await import('html2canvas');
      const canvas = await html2canvas.default(element, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        // allowTaint: true,
        // logging: false,
        // scrollX: 0,
        // scrollY: 0,
        // foreignObjectRendering: true,
        // imageTimeout: 15000,
        // removeContainer: true,
        // 解决白边问题
        x: 0,
        y: 0,
          // width: element.scrollWidth,
          // height: element.scrollHeight,
      });
      downloadCanvas(canvas, `XBIT_invite_${inviteCode}.jpg`);
      // toast.success('图片已保存到本地');
    } catch (err) {
      throw new Error('html2canvas failed');
    }
  };

  // // 下载Canvas
  const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/jpg');
    link.click();
  };

  // 滑动配置
  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "35px",
    slidesToShow: 1,
    speed: 500,
    arrows: false,
  };

  return (
    <div className="w-full max-w-sm mx-auto">
        {/* 卡片轮播区域 */}
        <div className="mb-[20px]">
          <div className="invite-slider" ref={sliderRef}>
            <Slider {...settings}>
              {cardThemes.map((theme, index) => (
                <div key={index} className="overflow-hidden rounded-[12px]">
                  <div
                    className={`w-full  overflow-hidden h-[320px]`}
                    style={{ backgroundImage: `${theme.background}`,backgroundSize:'100% 100%',backgroundRepeat:'no-repeat',padding:'18px 16px 0 16px' }}
                  >
                    {/* XBIT Logo */}
                    <div className="w-full flex items-end gap-2">
                     <img src="/images/xbit-logo.svg" alt="XBIT" className="size-7" />
                     <img src="/images/logo-xbit-text.svg" alt="XBIT" className="h-6" />
                    </div>

                    {/* 主要内容 */}
                    <div className=" inset-0 text-left mt-[16px]">
                      <h2 className="text-white text-[22px] font-bold mb-2 ">{t('inviteFriends.inviteToXBIT')}</h2>
                      <div className="text-white text-[16px] leading-[30px]">{t('inviteFriends.inviteText')}
                        {/* <br/>{t('inviteFriends.maxCommission50Percent')} */}
                        <span className="text-[28px] font-bold" style={{ color: theme.accentColor }}>
                          50
                        </span>
                        <span className="text-[16px] font-bold" style={{ color: theme.accentColor }}>%</span>
                      {t('inviteFriends.commission')}
                      </div>
                    </div>

                  </div>
                   {/* 底部信息 */}
                   <div className="bg-[#ffffff]" style={{padding:'10px 16px'}}>
                      <div className="flex justify-between" style={{alignItems:'normal'}}>
                        <div>
                          <p className="text-black text-[14px] mt-[10px]">{t('inviteFriends.scanQrCode')}</p>
                          <p className="text-black ">{t('inviteFriends.inviteCode')}：<span className='font-bold text-[16px]'>@{inviteCode}</span></p>
                        </div>
                        <div className="w-[62px] h-[62px]">
                        <QRCodeCanvas
                            value={window.location.origin+'/@'+inviteCode}
                            size={62}
                            marginSize={2}
                            imageSettings={{
                              src: '/images/xbit-logo-rounded.svg',
                              height: 14,
                              width: 14,
                              excavate: true,
                            }}
                            level="H"
                            className="rounded-[10px]"
                          />
                        </div>
                      </div>
                    </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>

        {/* 我的邀请码显示 */}
        <div className="px-3">
          <div className="w-full px-[12px] flex justify-between items-center h-[44px] rounded-[6px] border border-[rgba(236, 236, 237, 0.12)] bg-[#2c2c2e]">
              <div className="text-white text-[14px]">{t('inviteFriends.myInviteCode')}</div>
              <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-[18px]">@{inviteCode}</span>
                  <img src="/images/icons/icon-copy.svg" alt="" className="w-[16px] h-[16px] cursor-pointer" onClick={() => handleCopyLink(`@${inviteCode}`)}/>
              </div>
          </div>
          {/* 操作按钮 */}
          <div className="flex gap-3 mt-[20px]">
            <Button
              variant="purpleDefault"
              onClick={() => handleCopyLink(currentUrl+'/@'+inviteCode)}
              className="w-full text-white rounded-full h-12 text-[16px]  "
            >
              {t('inviteFriends.copyLink')}
            </Button>
            <Button
              variant="purpleDefault"
              onClick={handleSaveImage}
              disabled={isGeneratingImage}
              className="w-full text-white rounded-full h-12 disabled:opacity-50 text-[16px]"
            >
              {isGeneratingImage ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin  text-[16px]"></div>
                  {t('inviteFriends.generating')}
                </div>
              ) : (
                <div className="text-[16px]">{t('inviteFriends.saveImage')}</div>
              )}
            </Button>
          </div>
        </div>
      </div>
  );
});


export default InviteShareCard;
