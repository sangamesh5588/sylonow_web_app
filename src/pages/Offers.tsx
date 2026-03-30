import { Percent, ArrowRight } from "lucide-react";
import { Button, Card, Badge } from "../components/ui";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

const Offers = () => {
  const offers = [
    {
      id: "1",
      title: "First booking special",
      desc: "Get 20% off on your first decoration booking.",
      code: "CELEBRARE20",
      expiry: "Valid until April 30, 2024",
      color: "from-[#741EFF] to-[#FF4F81]",
    },
    {
      id: "2",
      title: "Anniversary love",
      desc: "Flat ₹1000 off on all anniversary packages above ₹5000.",
      code: "LOVE1000",
      expiry: "Valid until May 15, 2024",
      color: "from-[#0B4164] to-[#741EFF]",
    },
    {
      id: "3",
      title: "Birthday bash",
      desc: "Free cake table decor with any birthday package.",
      code: "BASHFREE",
      expiry: "Valid until June 1, 2024",
      color: "from-[#FF4F81] to-[#FFD93D]",
    }
  ];

  return (
    <div className="py-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#FFD93D] rounded-2xl flex items-center justify-center text-black">
          <Percent size={24} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Exclusive offers</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer, i) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-8 relative overflow-hidden group">
              <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl", offer.color)} />
              <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{offer.title}</h3>
                  <p className="text-gray-400 text-sm">{offer.desc}</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="bg-white/5 border border-dashed border-white/20 px-4 py-2 rounded-xl flex items-center gap-3">
                    <span className="text-sm font-bold tracking-widest">{offer.code}</span>
                    <button className="text-[10px] font-bold tracking-widest text-[#741EFF] hover:text-white transition-colors">Copy</button>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 tracking-widest">{offer.expiry}</span>
                </div>
                <Button variant="outline" className="w-full group-hover:bg-white group-hover:text-black transition-all">
                  Apply Offer <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Offers;
