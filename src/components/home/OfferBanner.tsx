import desktopBanner from "../../../desktop size.png";
import mobileBanner from "../../../mobile size.png";

export const OfferBanner = () => {
  return (
    <>
      <div className="overflow-hidden rounded-[10px] shadow-[0_18px_30px_rgba(246,30,95,0.16)] md:hidden">
        <img
          src={mobileBanner}
          alt="First booking offer"
          className="h-auto w-full rounded-[10px] object-cover"
          loading="lazy"
        />
      </div>

      <div className="hidden overflow-hidden rounded-[10px] md:block">
        <img
          src={desktopBanner}
          alt="First booking offer"
          className="h-auto w-full rounded-[10px] object-cover"
          loading="lazy"
        />
      </div>
    </>
  );
};
