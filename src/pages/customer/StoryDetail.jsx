import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { getProductById, getProducts } from '../../services/api';
import { useCartStore } from '../../stores';
import { useAuth } from '../../contexts/AuthContext';
import { Toast } from '../../components/common';
import SizeMatrixModal from '../../components/product/SizeMatrixModal';
import { safeBack } from '../../utils';
// =========================================================================
// TOÀN BỘ DATA BÀI VIẾT EDITORIAL STORY (5 PHẦN) ĐƯỢC LƯU TRỰC TIẾP TRONG GIAO DIỆN
// =========================================================================
const EDITORIAL_STORIES = {
  prd_set_01: {
    id: 'prd_set_01',
    styleNumber: '01',
    styleName: 'QUIET STRUCTURE',
    setName: 'Military Officer Jacket & Shorts Set',
    origin: 'Drafted and assembled in Veneto, Italy under M STUDIO Atelier.',
    batch: 'Limited Release: 12 Units Worldwide',
    quote: 'Precision is not the absence of emotion; it is the discipline of form.',
    designPillars: [
      {
        title: 'DESIGN CONCEPT',
        content: 'Inspired by ceremonial 19th-century naval regalia deconstructed through a brutalist lens. Strict symmetry meets modern utilitarian proportions.'
      },
      {
        title: 'SHAPE & VOLUME',
        content: 'Structured boxy upper torso tapering sharply into micro proportions. High contrast between jacket volume and form-fitting ribbed bottom.'
      },
      {
        title: 'KEY VISUAL DETAILS',
        content: 'Antiqued custom-molded silver buttons featuring the M STUDIO atelier crest. High stand officer collar with dual internal hooks.'
      },
      {
        title: 'SILHOUETTE',
        content: 'Architectural hour-glass illusion with pronounced shoulder pad architecture and razor-sharp peak lapels.'
      },
      {
        title: 'CONSTRUCTION',
        content: 'Full floating canvas chest piece. Bonded interlining ensures the jacket retains its rigid sculpture even during dynamic movement.'
      },
      {
        title: 'STYLING DIRECTION',
        content: 'Pair with knee-high structured leather boots and dark geometric eyewear for an authoritative avant-garde presence.'
      }
    ],
    brandInfo: {
      name: 'M STUDIO',
      tagline: 'Modern Tailoring & Monochromatic Atelier',
      description: 'M STUDIO is an independent avant-garde design house dedicated to sculptural silhouettes, industrial chrome hardware, and experimental monochrome fashion. Every piece is developed through architectural drafting techniques.'
    },
    brandPillars: [
      {
        title: 'STRUCTURAL DEFIANCE',
        desc: 'Rejecting fluid softness in favor of geometric tension and uncompromising architectural angles.'
      },
      {
        title: 'MONOCHROME RESTRAINT',
        desc: 'Restricting the color palette exclusively to stark whites, deep obsidian, and raw mineral greys.'
      },
      {
        title: 'BESPOKE CASTINGS',
        desc: 'Every button, buckle, and zipper pull is custom alloy cast in Northern Italy exclusively for FASHORA.'
      },
      {
        title: 'LIMITED BATCHES',
        desc: 'Produced strictly in numbered limited runs of under 20 pieces to preserve true artisanal integrity.'
      }
    ],
    materialSpecs: [
      {
        title: 'RAW MATERIAL & ORIGIN',
        details: '70% High-twist Poly-twill, 30% Rayon suiting woven in Biella, Italy. Density of 380gsm for crisp structural drape.'
      },
      {
        title: 'HARDWARE & PRECISION',
        details: 'Custom die-cast zinc alloy dome buttons with hand-antiqued oxidized silver patina. Nickel-free and anti-tarnish coated.'
      },
      {
        title: 'ARTISANAL FINISHING',
        details: 'Internal seams bound with 100% Japanese Bemberg cupro piping. Blind hand-stitched hem and armhole bar-tacking.'
      }
    ],
    narrative: [
      {
        chapter: 'THE BRUTALIST SPARK & INSPIRATION',
        text: 'The inception of the Military Officer Set began with a study of post-war civic architecture across Western Europe. We sought to translate the monumental permanence of exposed concrete facade lines into wearable garments. The sharp shoulder line acts as a visual beam, bearing the tension of the overall silhouette.'
      },
      {
        chapter: 'DESIGN INTENTION & GARMENTS AS SHELTERS',
        text: 'In an era of hyper-fast digital consumption, clothing must serve as more than adornment—it must function as personal armor. The double-breasted closure provides an impenetrable shield against urban noise, giving the wearer an unmistakable posture of quiet authority and self-containment.'
      },
      {
        chapter: 'TRANSCENDING EPHEMERAL TRENDS',
        text: 'Trends expire within months, but structural integrity endures across decades. By stripping away ornamental prints and relying solely on the relationship between fabric density, shoulder curvature, and metal weight, the Quiet Structure set establishes a permanent dialogue with timeless elegance.'
      }
    ]
  },

  prd_set_02: {
    id: 'prd_set_02',
    styleNumber: '02',
    styleName: 'MODERN UTILITY',
    setName: 'Quilted Biker Jacket & Flare Denim Set',
    origin: 'Engineered for FASHORA Runway Collection by M STUDIO.',
    batch: 'Limited Release: 15 Units Worldwide',
    quote: 'Utility is redefined when industrial grit converges with ergonomic beauty.',
    designPillars: [
      {
        title: 'DESIGN CONCEPT',
        content: 'A collision of 1970s cafe racer subculture and neo-cyberpunk denim workwear. Rugged abrasion patterns meet precision diamond quilting.'
      },
      {
        title: 'SHAPE & VOLUME',
        content: 'Cropped, articulated moto jacket framing an ultra-low slung, floor-sweeping flare denim silhouette.'
      },
      {
        title: 'KEY VISUAL DETAILS',
        content: 'Heavyweight asymmetrical chrome zip track, quilted elbow impact zones, and bleach-whiskered mineral denim pooling at the hem.'
      },
      {
        title: 'SILHOUETTE',
        content: 'Low-slung, dynamic elongated leg-line contrasted with a compact, torso-hugging moto outer shell.'
      },
      {
        title: 'CONSTRUCTION',
        content: 'Multi-panel ergonomic sleeve curvature engineered for uninhibited arm articulation. Gusseted back panels.'
      },
      {
        title: 'STYLING DIRECTION',
        content: 'Wear jacket unzipped with industrial silver chains, paired with heavy lugged-sole combat boots.'
      }
    ],
    brandInfo: {
      name: 'M STUDIO',
      tagline: 'Modern Tailoring & Monochromatic Atelier',
      description: 'M STUDIO continues to push the frontier of wearable tech-couture. Combining heavy vegan leathers with Japanese selvedge treatments.'
    },
    brandPillars: [
      {
        title: 'STRUCTURAL DEFIANCE',
        desc: 'Reinterpreting moto jackets with extreme cropped proportions and architectural collar snaps.'
      },
      {
        title: 'MONOCHROME RESTRAINT',
        desc: 'Exploring deep asphalt blacks and enzyme-washed dark graphite tones.'
      },
      {
        title: 'BESPOKE CASTINGS',
        desc: 'Heavy-gauge industrial #10 YKK two-way zippers with custom engraved pull-tabs.'
      },
      {
        title: 'LIMITED BATCHES',
        desc: 'Each denim pair is hand-sanded and numbered by the lead artisan in our workshop.'
      }
    ],
    materialSpecs: [
      {
        title: 'RAW MATERIAL & ORIGIN',
        details: 'Jacket: 1.2mm textured vegan moto leather with breathable polyurethane backing. Denim: 13.5oz organic ring-spun cotton denim.'
      },
      {
        title: 'HARDWARE & PRECISION',
        details: 'Solid steel hardware with blackened gunmetal electroplating. Reinforced pocket rivets tested to 50kg shear force.'
      },
      {
        title: 'ARTISANAL FINISHING',
        details: 'Manual pumice stone wash followed by localized enzyme dipping to create realistic organic wear gradients.'
      }
    ],
    narrative: [
      {
        chapter: 'THE BRUTALIST SPARK & INSPIRATION',
        text: 'The Modern Utility look was born on the high-speed transit rings of Tokyo and Seoul. We observed how commuters navigate high-density concrete metropolises, demanding apparel that resists wind, abrasion, and unpredictable weather without sacrificing high-fashion visual impact.'
      },
      {
        chapter: 'DESIGN INTENTION & GARMENTS AS SHELTERS',
        text: 'The quilted leather acts as an exoskeleton. It gives psychological confidence to the wearer, transforming casual movement through the city into a kinetic performance. The flare denim balances this heaviness with fluid, rhythmic strides.'
      },
      {
        chapter: 'TRANSCENDING EPHEMERAL TRENDS',
        text: 'Fast fashion mimics leather with flimsy films; we construct garments with substantial structural mass. This set is engineered to age gracefully, developing unique patina creases that document the wearer’s personal journeys over years.'
      }
    ]
  },

  prd_set_03: {
    id: 'prd_set_03',
    styleNumber: '03',
    styleName: 'SOFT MINIMAL',
    setName: 'Shearling Leather Jacket & Cable Knit Skirt Set',
    origin: 'Curated European winter capsule by M STUDIO.',
    batch: 'Limited Release: 10 Units Worldwide',
    quote: 'Softness gains supreme power when cradled inside a sculpted, resilient frame.',
    designPillars: [
      {
        title: 'DESIGN CONCEPT',
        content: 'Tonal exploration of thermal contrasts: cold cracked vintage leather outer shell enveloped in warmth by plush shearling and wool cabling.'
      },
      {
        title: 'SHAPE & VOLUME',
        content: 'Voluminous cocoon bomber silhouette balanced by an unbroken column line of ribbed cable knit extending to the floor.'
      },
      {
        title: 'KEY VISUAL DETAILS',
        content: 'Twin collar leather buckle straps, exposed shearling cuffs, and subtle asymmetric ribbing along the skirt walking vent.'
      },
      {
        title: 'SILHOUETTE',
        content: 'Columnar, statuesque profile that elongates vertical proportions while creating comforting protective upper body volume.'
      },
      {
        title: 'CONSTRUCTION',
        content: 'Furrier-stitched seams eliminate interior bulk. Heavy rib-knit waistband ensures the skirt anchors firmly at the natural waist.'
      },
      {
        title: 'STYLING DIRECTION',
        content: 'Accentuate with square-toe minimalist leather mules and a stark silver choker.'
      }
    ],
    brandInfo: {
      name: 'M STUDIO',
      tagline: 'Modern Tailoring & Monochromatic Atelier',
      description: 'M STUDIO winter collections champion tactile richness and raw organic textures balanced with ruthless geometric cuts.'
    },
    brandPillars: [
      {
        title: 'STRUCTURAL DEFIANCE',
        desc: 'Reshaping winter outerwear into sculptural shields rather than shapeless puffy down jackets.'
      },
      {
        title: 'MONOCHROME RESTRAINT',
        desc: 'Subtle gradation of espresso brown, deep midnight navy, and natural unbleached fleece.'
      },
      {
        title: 'BESPOKE CASTINGS',
        desc: 'Brushed antique brass roller buckles with hand-buffed perimeter bevels.'
      },
      {
        title: 'LIMITED BATCHES',
        desc: 'Produced strictly in 10 numbered pieces due to the rarity of our custom shearling blend.'
      }
    ],
    materialSpecs: [
      {
        title: 'RAW MATERIAL & ORIGIN',
        details: 'Jacket: Cracked grain vegan leather with 800gsm dense acrylic shearling pile. Skirt: 60% Australian Merino Wool, 40% Low-pilling acrylic.'
      },
      {
        title: 'HARDWARE & PRECISION',
        details: 'Double-row antique brass throat latch hardware with laser-engraved sizing increments.'
      },
      {
        title: 'ARTISANAL FINISHING',
        details: 'Hand-finished knit binding prevents hem rolling. Leather edges sealed with three coats of Italian matte edge paint.'
      }
    ],
    narrative: [
      {
        chapter: 'THE BRUTALIST SPARK & INSPIRATION',
        text: 'Inspired by the harsh winter landscapes of Nordic archipelagos, where brutal granite cliffs meet freezing coastal gales. Soft Minimal seeks to answer the biological need for shelter with an aesthetic of pure, unadorned sculpture.'
      },
      {
        chapter: 'DESIGN INTENTION & GARMENTS AS SHELTERS',
        text: 'The tactile experience is deliberate. When slipping into this jacket, the tactile transition from cool cracked leather exterior to cloud-like shearling lining creates an immediate sensory cocoon of calm amid bustling urban environments.'
      },
      {
        chapter: 'TRANSCENDING EPHEMERAL TRENDS',
        text: 'Cable knit and shearling are heritage staples of human survival. By stripping them of folksy motifs and applying rigorous minimalist proportions, this ensemble transcends fleeting micro-trends to become an archival winter monument.'
      }
    ]
  },

  prd_set_04: {
    id: 'prd_set_04',
    styleNumber: '04',
    styleName: 'TAILORED EASE',
    setName: 'Double Collar Denim Jacket & Baggy Jeans Set',
    origin: 'Manufactured with artisanal denim washes for M STUDIO.',
    batch: 'Limited Release: 18 Units Worldwide',
    quote: 'True luxury lies in the effortless nonchalance of impeccable geometry.',
    designPillars: [
      {
        title: 'DESIGN CONCEPT',
        content: 'Deconstructed Americana workwear elevated into high fashion. Layered trompe-l’œil collars challenge conventional garment anatomy.'
      },
      {
        title: 'SHAPE & VOLUME',
        content: 'Generous dropped shoulders with a cropped body, counterpointed by ultra-slouchy baggy puddle jeans.'
      },
      {
        title: 'KEY VISUAL DETAILS',
        content: 'Dual layered contrasting denim collars, double-knee panel reinforcements, and subtle vintage indigo tint wash.'
      },
      {
        title: 'SILHOUETTE',
        content: 'Relaxed, slouchy yet deliberate drape that creates an effortless skateboard-couture posture.'
      },
      {
        title: 'CONSTRUCTION',
        content: 'Triple-needle chainstitching throughout stress points. Riveted pocket bags prevent blowouts over years of heavy wear.'
      },
      {
        title: 'STYLING DIRECTION',
        content: 'Style with an unbuttoned crisp white poplin shirt underneath and minimal leather sling bag.'
      }
    ],
    brandInfo: {
      name: 'M STUDIO',
      tagline: 'Modern Tailoring & Monochromatic Atelier',
      description: 'M STUDIO experiments with traditional blue-collar garments, transforming heavy canvas and denim into refined sculptural uniforms.'
    },
    brandPillars: [
      {
        title: 'STRUCTURAL DEFIANCE',
        desc: 'Re-engineering the classic trucker jacket with architectural layered collars.'
      },
      {
        title: 'MONOCHROME RESTRAINT',
        desc: 'Faded mineral wash indigo paired with raw undyed ecru threads.'
      },
      {
        title: 'BESPOKE CASTINGS',
        desc: 'Solid steel donut shank buttons with matte silver cadmium wash.'
      },
      {
        title: 'LIMITED BATCHES',
        desc: 'Small-scale run crafted exclusively with artisan mills utilizing vintage shuttle looms.'
      }
    ],
    materialSpecs: [
      {
        title: 'RAW MATERIAL & ORIGIN',
        details: '100% Ring-spun 14oz heavyweight cotton denim from Okayama, Japan. Rigid unwashed feel softened through eco-ozone treatment.'
      },
      {
        title: 'HARDWARE & PRECISION',
        details: 'Custom branded steel shank buttons and heavy brass zipper fly with automatic locking slider.'
      },
      {
        title: 'ARTISANAL FINISHING',
        details: 'Multi-stage localized pumice wash with hand-applied whiskers and subtle tinting at collar folds.'
      }
    ],
    narrative: [
      {
        chapter: 'THE BRUTALIST SPARK & INSPIRATION',
        text: 'We drew inspiration from architectural blueprints where structural layers are left intentionally exposed. The double collar serves as a visual metaphor for layered realities—a jacket within a jacket, reflecting the multifaceted identities of modern creative directors.'
      },
      {
        chapter: 'DESIGN INTENTION & GARMENTS AS SHELTERS',
        text: 'The relaxed cut allows complete kinetic freedom. The fabric moves around the body rather than constricting it, providing a sanctuary of physical ease while maintaining a formidable, curated silhouette.'
      },
      {
        chapter: 'TRANSCENDING EPHEMERAL TRENDS',
        text: 'Denim is the only textile that chronicles its wearer’s biography through fading and creases. This set is crafted with heirloom intention—destined to be passed down and treasured as a vintage artifact twenty years from now.'
      }
    ]
  },

  prd_set_05: {
    id: 'prd_set_05',
    styleNumber: '05',
    styleName: 'URBAN FORM',
    setName: 'Architectural Funnel Leather Jacket & Zip Pants Set',
    origin: 'Developed at FASHORA Design Studio, Paris 8th Arrondissement.',
    batch: 'Limited Release: 08 Units Worldwide',
    quote: 'The pinnacle of avant-garde minimalism: pure line, pure shadow, pure intention.',
    designPillars: [
      {
        title: 'DESIGN CONCEPT',
        content: 'Brutalist monolith aesthetics translated into stark monochromatic white and black. Funnel collar shields the face like a high-tech fortress.'
      },
      {
        title: 'SHAPE & VOLUME',
        content: 'Sharp diagonal cut lines across the chest. Articulated curved sleeves with continuous spiral metal zippers running down the leg.'
      },
      {
        title: 'KEY VISUAL DETAILS',
        content: 'High sculptural funnel neck with concealed magnetic fasteners, stark chalk-white leather body, and contrasting obsidian spiral tracks.'
      },
      {
        title: 'SILHOUETTE',
        content: 'Aerodynamic, statuesque stance with forward-pitched shoulders and modular zippered leg tapers.'
      },
      {
        title: 'CONSTRUCTION',
        content: 'Fully taped internal seams on trousers with waterproof backing. Jacket utilizes internal sleeve darts for anatomic ergonomic bend.'
      },
      {
        title: 'STYLING DIRECTION',
        content: 'Wear zipped to the chin with chrome-heeled boots and liquid silver eyewear for a runway cyber aesthetic.'
      }
    ],
    brandInfo: {
      name: 'M STUDIO',
      tagline: 'Modern Tailoring & Monochromatic Atelier',
      description: 'The pinnacle of M STUDIO’s experimental capsule line. Pushing the boundaries of technical tailoring and futuristic haute couture.'
    },
    brandPillars: [
      {
        title: 'STRUCTURAL DEFIANCE',
        desc: 'Radical asymmetric collar geometry that holds its upright shape without rigid wires.'
      },
      {
        title: 'MONOCHROME RESTRAINT',
        desc: 'Pure contrast between surgical stark white and light-absorbing onyx black.'
      },
      {
        title: 'BESPOKE CASTINGS',
        desc: 'Concealed neodymium magnetic clasps and waterproof reverse-coil spiral zippers.'
      },
      {
        title: 'LIMITED BATCHES',
        desc: 'Ultra-exclusive run of only 8 sets globally due to the intense hand-tailoring required.'
      }
    ],
    materialSpecs: [
      {
        title: 'RAW MATERIAL & ORIGIN',
        details: 'Jacket: High-grade matte polyurethane leather with nano stain-resistant coating. Pants: 3-layer technical waterproof ripstop nylon.'
      },
      {
        title: 'HARDWARE & PRECISION',
        details: 'Full continuous 120cm spiral metal leg zippers with bidirectional ergonomic sliders.'
      },
      {
        title: 'ARTISANAL FINISHING',
        details: 'Laser-cut panel borders welded with ultrasonic heat sealing to guarantee zero stitch fraying.'
      }
    ],
    narrative: [
      {
        chapter: 'THE BRUTALIST SPARK & INSPIRATION',
        text: 'The Urban Form set is an ode to the monumental geometries of Zaha Hadid and the futuristic skyline of modern megacities. By translating swooping aerodynamic vectors into leather tailoring, the garment appears suspended in perpetual forward motion.'
      },
      {
        chapter: 'DESIGN INTENTION & GARMENTS AS SHELTERS',
        text: 'The high funnel neck can be closed completely, creating a personal sanctuary from sensory overload in crowded urban centers. When zipped, the world outside is muted, placing the wearer in a state of tranquil focus.'
      },
      {
        chapter: 'TRANSCENDING EPHEMERAL TRENDS',
        text: 'This is not fashion intended for standard commercial seasons—it is wearable sculpture. It rejects decorative ornamentation in favor of absolute functional purity and structural boldness.'
      }
    ]
  },

  prd_set_06: {
    id: 'prd_set_06',
    styleNumber: '06',
    styleName: 'EVERYDAY MINIMAL',
    setName: 'Colorblock Buckled Cardigan & Leather Pants Set',
    origin: 'Curated for FASHORA Daily Editorial Capsule by M STUDIO.',
    batch: 'Limited Release: 14 Units Worldwide',
    quote: 'Simplicity is about subtracting the obvious and adding the meaningful.',
    designPillars: [
      {
        title: 'DESIGN CONCEPT',
        content: 'Elevating daily uniform dressing through unexpected material alchemy: heavy ribbed colorblock knit contrasted against sleek vegan leather trousers.'
      },
      {
        title: 'SHAPE & VOLUME',
        content: 'Relaxed cardigan drop with cinched waist hardware, falling effortlessly over straight-leg structured leather pants.'
      },
      {
        title: 'KEY VISUAL DETAILS',
        content: 'Dual industrial side-release buckle straps securing the front closure in lieu of conventional buttons. Subtle ivory colorblocking.'
      },
      {
        title: 'SILHOUETTE',
        content: 'Fluid, approachable vertical lines anchored by the rich sheen and structure of tailored leather.'
      },
      {
        title: 'CONSTRUCTION',
        content: 'Gauge 7 heavy knit stitch structure prevents sagging. Pants feature a contoured waistband preventing back gapping.'
      },
      {
        title: 'STYLING DIRECTION',
        content: 'Leave one buckle unfastened for asymmetric casual drape, paired with chunky silver rings and minimalist derbies.'
      }
    ],
    brandInfo: {
      name: 'M STUDIO',
      tagline: 'Modern Tailoring & Monochromatic Atelier',
      description: 'M STUDIO’s core everyday line brings high-fashion conceptual drafting into garments engineered for comfortable daily ritual.'
    },
    brandPillars: [
      {
        title: 'STRUCTURAL DEFIANCE',
        desc: 'Replacing predictable cardigan buttons with industrial quick-release seatbelt buckles.'
      },
      {
        title: 'MONOCHROME RESTRAINT',
        desc: 'Warm ecru colorblocking seamlessly fused with deep charcoal and midnight leather.'
      },
      {
        title: 'BESPOKE CASTINGS',
        desc: 'Matte black aluminum quick-release buckles engraved with the atelier coordinate code.'
      },
      {
        title: 'LIMITED BATCHES',
        desc: 'Small-batch production ensuring every knit row is tension-calibrated by hand.'
      }
    ],
    materialSpecs: [
      {
        title: 'RAW MATERIAL & ORIGIN',
        details: 'Cardigan: 70% Combed Cotton, 30% Mulberry Silk blend yarn. Pants: Supple 0.9mm vegan leather with brushed fleece backing.'
      },
      {
        title: 'HARDWARE & PRECISION',
        details: 'Anodized aluminum buckle closures with stainless steel internal spring release mechanisms.'
      },
      {
        title: 'ARTISANAL FINISHING',
        details: 'Hand-linked collar ribbing and reinforced leather belt loops bar-tacked at 42 stitches per inch.'
      }
    ],
    narrative: [
      {
        chapter: 'THE BRUTALIST SPARK & INSPIRATION',
        text: 'The Everyday Minimal uniform was created for the modern creative who transitions effortlessly from private atelier studio sessions to evening exhibition openings. It provides the visual prestige of high fashion without compromising the physical ease needed for deep focus.'
      },
      {
        chapter: 'DESIGN INTENTION & GARMENTS AS SHELTERS',
        text: 'Comfort should never mean compromise. The cotton-silk cardigan breathes naturally while the buckle mechanism gives an intentional, satisfying click upon fastening—a small daily ritual of stepping into one’s creative role.'
      },
      {
        chapter: 'TRANSCENDING EPHEMERAL TRENDS',
        text: 'By rooting this set in monochromatic balance and timeless textural contrast, it remains completely immune to seasonality. It is a foundational cornerstone of a conscious, permanent wardrobe.'
      }
    ]
  }
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80';

const formatVND = (val) =>
  new Intl.NumberFormat('vi-VN').format(Number(val) || 0) + '₫';

export default function StoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Chuẩn hóa ID sản phẩm nếu người dùng truyền dạng "set-01" thay vì "prd_set_01"
  const normalizedId = useMemo(() => {
    if (!id) return 'prd_set_01';
    if (id.startsWith('prd_set_')) return id;
    if (id.startsWith('set-')) return `prd_${id.replace('-', '_')}`;
    return id;
  }, [id]);

  // Lấy dữ liệu bài viết editorial tương ứng
  const story = useMemo(() => {
    return EDITORIAL_STORIES[normalizedId] || EDITORIAL_STORIES.prd_set_01;
  }, [normalizedId]);

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [showSizeModal, setShowSizeModal] = useState(false);

  const addToCartStore = useCartStore((state) => state.addToCart);

  // Tải chi tiết sản phẩm từ API
  useEffect(() => {
    let isMounted = true;
    async function fetchProduct() {
      try {
        const res = await getProductById(normalizedId);
        const prod = res?.data || res;
        if (isMounted && prod && (prod.id || prod.name)) {
          setProduct(prod);
          if (prod.sizes && prod.sizes.length > 0) {
            setSelectedSize(prod.sizes[0]);
          }
        } else if (isMounted) {
          // Thử lấy từ getProducts nếu getProductById không tìm thấy
          const allRes = await getProducts();
          const all = Array.isArray(allRes?.data) ? allRes.data : (Array.isArray(allRes) ? allRes : []);
          const found = all.find((p) => p.id === normalizedId);
          if (found) {
            setProduct(found);
            if (found.sizes && found.sizes.length > 0) {
              setSelectedSize(found.sizes[0]);
            }
          }
        }
      } catch (err) {
        console.error('Error loading Set details for StoryDetail:', err);
      }
    }
    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [normalizedId]);

  // Ảnh chính và phụ
  const primaryImg = product?.images?.[0] || `/images/products/set/${normalizedId.replace('prd_', '').replace('_', '-')}.jpg`;
  const secondaryImg = product?.images?.[1] || `/images/products/set/${normalizedId.replace('prd_', '').replace('_', '-')}-hover.jpg`;

  const availableSizes = product?.sizes || ['S', 'M', 'L'];
  const price = product?.price || 1250000;
  const originalPrice = product?.originalPrice;

  const { currentUser } = useAuth();

  // 1. Thêm vào giỏ hàng: Khách vãng lai chưa đăng nhập vẫn thêm được tự do
  const handleAddToCart = () => {
    const itemToAdd = {
      id: product?.id || normalizedId,
      name: product?.name || story.setName || 'SET COLLECTION',
      price: Number(product?.price) || Number(price) || 1250000,
      image: primaryImg,
      images: product?.images || [primaryImg, secondaryImg],
      category: product?.category || 'SET',
      shopId: product?.shopId || 'shop_m_studio',
      shopName: product?.shopName || story.brandInfo?.name || 'M STUDIO',
      stock: product?.stock ?? 99
    };

    const result = addToCartStore(
      itemToAdd,
      selectedSize || 'One Size',
      product?.colors?.[0] || 'Black',
      quantity || 1
    );

    if (result?.success === false) {
      setToastMessage(result.message);
      return;
    }

    const targetName = (product?.name || story.setName || 'SET COLLECTION').toUpperCase();
    setToastMessage(`ADDED ${targetName} TO CART.`);
  };

  // 2. Mua ngay / Thanh toán: Bắt buộc đăng nhập nếu chưa login
  const handleProceedToCheckout = () => {
    const itemToAdd = {
      id: product?.id || normalizedId,
      name: product?.name || story.setName || 'SET COLLECTION',
      price: Number(product?.price) || Number(price) || 1250000,
      image: primaryImg,
      images: product?.images || [primaryImg, secondaryImg],
      category: product?.category || 'SET',
      shopId: product?.shopId || 'shop_m_studio',
      shopName: product?.shopName || story.brandInfo?.name || 'M STUDIO',
      stock: product?.stock ?? 99
    };

    addToCartStore(
      itemToAdd,
      selectedSize || 'One Size',
      product?.colors?.[0] || 'Black',
      quantity || 1
    );

    const selectedCartItem = {
      ...itemToAdd,
      selectedSize: selectedSize || 'One Size',
      selectedColor: product?.colors?.[0] || 'Black',
      quantity: quantity || 1
    };

    try {
      sessionStorage.setItem('fashora_checkout_items', JSON.stringify([selectedCartItem]));
    } catch {
      // ignore
    }

    // Nghiệp vụ: Chưa đăng nhập -> Chuyển hướng sang /login để đăng nhập trước khi checkout
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUser && !currentUserId) {
      navigate('/login', {
        state: {
          from: {
            pathname: '/checkout'
          }
        }
      });
      return;
    }

    // Đã đăng nhập -> Cho phép vào thẳng /checkout
    navigate('/checkout', {
      state: {
        selectedItems: [selectedCartItem]
      }
    });
  };

  return (
    <div className="w-full bg-white text-black min-h-screen">
      {/* =========================================================================
          ĐẦU TRANG (NỀN TRẮNG):
          - Nút quay lại trang /explore
          - Tên Set in hoa lớn
          - Cột ảnh Asymmetric Editorial:
            * Ảnh chính lớn bên phải (images[0])
            * Ảnh phụ nhỏ bên trái phía trên (images[1])
            * Phía dưới ảnh phụ là thông số nguồn gốc sản xuất (Origin & Batch)
          ========================================================================= */}
      <section className="max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16 pt-8 sm:pt-12 pb-16 sm:pb-20">
        {/* Nút thoát nhanh về Explore */}
        <div className="mb-8 sm:mb-10">
          <button
            type="button"
            onClick={() => safeBack(navigate, '/explore')}
            className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.2em] uppercase text-neutral-500 hover:text-black transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>RETURN TO EXPLORE ARCHIVE</span>
          </button>
        </div>

        {/* Tiêu đề & Phong cách */}
        <div className="max-w-4xl mb-10 sm:mb-14">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-neutral-400">
              [ EDITORIAL STORY {story.styleNumber} ]
            </span>
            <span className="h-px w-8 bg-neutral-300" />
            <span className="text-xs font-mono tracking-[0.2em] text-neutral-600 uppercase">
              {story.styleName}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-neutral-950 leading-tight">
            {story.setName}
          </h1>
        </div>

        {/* Bố cục Ảnh Asymmetric Editorial */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Cột trái (5 phần 12): Ảnh phụ nhỏ phía trên + Thông số xuất xứ phía dưới */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            {/* Ảnh phụ nhỏ */}
            <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden border border-neutral-200">
              <img
                src={secondaryImg}
                alt={`${story.setName} Detail View`}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = primaryImg || FALLBACK_IMAGE;
                }}
              />
              <span className="absolute bottom-3 left-3 bg-white/95 px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase border border-neutral-200">
                PLATE II / PROFILE DETAIL
              </span>
            </div>

            {/* Thông số nguồn gốc sản xuất */}
            <div className="p-6 bg-neutral-50 border border-neutral-200 space-y-4">
              <div className="flex items-center gap-2 text-neutral-900">
                <ShieldCheck className="w-4 h-4 text-neutral-700" />
                <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase">
                  ATELIER PROVENANCE
                </span>
              </div>

              <div className="space-y-2 text-xs font-light text-neutral-600 leading-relaxed">
                <p>
                  <strong className="font-semibold text-neutral-800">Origin: </strong>
                  {story.origin}
                </p>
                <p>
                  <strong className="font-semibold text-neutral-800">Production Run: </strong>
                  {story.batch}
                </p>
                <p>
                  <strong className="font-semibold text-neutral-800">Philosophy: </strong>
                  &ldquo;{story.quote}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Cột phải (7 phần 12): Ảnh chính lớn */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-neutral-100 overflow-hidden border border-neutral-200 shadow-sm">
              <img
                src={primaryImg}
                alt={`${story.setName} Hero`}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <span className="absolute bottom-4 left-4 bg-black text-white px-3 py-1 text-[10px] font-mono tracking-[0.2em] uppercase">
                PLATE I / FULL SILHOUETTE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PHẦN 1: THE DESIGN (NỀN TRẮNG)
          - Gồm 6 thẻ chi tiết kỹ thuật:
            1. DESIGN CONCEPT
            2. SHAPE & VOLUME
            3. KEY VISUAL DETAILS
            4. SILHOUETTE
            5. CONSTRUCTION
            6. STYLING DIRECTION
          ========================================================================= */}
      <section className="bg-white border-t border-neutral-200 py-16 sm:py-24">
        <div className="max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-neutral-400 block mb-2 uppercase">
              SECTION 01
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 mb-3">
              THE DESIGN
            </h2>
            <div className="w-12 h-0.5 bg-black mb-3" />
            <p className="text-xs sm:text-sm text-neutral-500 uppercase tracking-wider font-light">
              Deconstructive architectural anatomy and formal specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {story.designPillars.map((pillar, pIdx) => (
              <div
                key={pIdx}
                className="p-6 sm:p-8 bg-neutral-50 border border-neutral-200 hover:border-black transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono tracking-widest text-neutral-400">
                      0{pIdx + 1}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-neutral-300" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-900 mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">
                    {pillar.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          PHẦN 2: THE BRAND BEHIND THE PIECE (NỀN ĐEN TUYỀN: bg-[#111111])
          - Cột trái: Tên shop & Mô tả shop
          - Cột phải: 4 mục cốt lõi:
            * STRUCTURAL DEFIANCE
            * MONOCHROME RESTRAINT
            * BESPOKE CASTINGS
            * LIMITED BATCHES
          ========================================================================= */}
      <section className="bg-[#111111] text-white py-20 sm:py-28 border-y border-neutral-800">
        <div className="max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Cột trái: Thông tin Atelier */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-mono font-bold tracking-[0.25em] text-neutral-400 uppercase block">
                SECTION 02 / ATELIER IDENTITY
              </span>

              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
                THE BRAND BEHIND THE PIECE
              </h2>

              <div className="pt-2">
                <span className="inline-block text-xs font-mono tracking-[0.2em] text-neutral-300 uppercase px-3 py-1 bg-white/10 border border-white/20 mb-4">
                  {story.brandInfo.name} — {story.brandInfo.tagline}
                </span>

                <p className="text-xs sm:text-sm font-light text-neutral-300 leading-relaxed tracking-wide">
                  {story.brandInfo.description}
                </p>
              </div>
            </div>

            {/* Cột phải: 4 Trụ cột thương hiệu */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {story.brandPillars.map((bp, bpIdx) => (
                <div
                  key={bpIdx}
                  className="p-6 bg-neutral-900 border border-neutral-800 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-neutral-500 block mb-2">
                      PILLAR 0{bpIdx + 1}
                    </span>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
                      {bp.title}
                    </h3>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      {bp.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PHẦN 3: MATERIAL & CRAFT (NỀN TRẮNG)
          - 3 khối card thông số chất liệu và kỹ thuật gia công:
            * RAW MATERIAL & ORIGIN
            * HARDWARE & PRECISION
            * ARTISANAL FINISHING
          ========================================================================= */}
      <section className="bg-white py-16 sm:py-24 border-b border-neutral-200">
        <div className="max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-neutral-400 block mb-2 uppercase">
              SECTION 03
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 mb-3">
              MATERIAL & CRAFT
            </h2>
            <div className="w-12 h-0.5 bg-black mb-3" />
            <p className="text-xs sm:text-sm text-neutral-500 uppercase tracking-wider font-light">
              Tactile resilience, bespoke metal casting, and uncompromising assembly standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {story.materialSpecs.map((spec, sIdx) => (
              <div
                key={sIdx}
                className="p-6 sm:p-8 border border-neutral-200 bg-neutral-50 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-neutral-400 block mb-3">
                    SPECIFICATION 0{sIdx + 1}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-900 mb-3">
                    {spec.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
                    {spec.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          PHẦN 4: THE STORY BEHIND IT (NỀN TRẮNG)
          - Cột trái: Tiêu đề phần & Luận điểm
          - Cột phải: 3 đoạn văn:
            * THE BRUTALIST SPARK & INSPIRATION
            * DESIGN INTENTION & GARMENTS AS SHELTERS
            * TRANSCENDING EPHEMERAL TRENDS
          ========================================================================= */}
      <section className="bg-neutral-50/50 py-16 sm:py-24 border-b border-neutral-200">
        <div className="max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Cột trái: Tiêu đề */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-mono font-bold tracking-[0.25em] text-neutral-400 uppercase block">
                SECTION 04 / ESSAY
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">
                THE STORY BEHIND IT
              </h2>
              <div className="w-12 h-0.5 bg-black" />
              <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest leading-relaxed pt-2">
                An inquiry into the permanence of structural tailoring in an age of disposable speed.
              </p>
            </div>

            {/* Cột phải: 3 Đoạn văn luận điểm */}
            <div className="lg:col-span-8 space-y-8 sm:space-y-10">
              {story.narrative.map((chapter, cIdx) => (
                <div key={cIdx} className="space-y-3 pb-8 border-b border-neutral-200 last:border-b-0">
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-neutral-900">
                    {chapter.chapter}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-light tracking-wide text-justify">
                    {chapter.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PHẦN 5: THE PIECE (NỀN TRẮNG - KHU VỰC MUA SẮM)
          - Card sản phẩm đầy đủ với ảnh, tên, giá VND
          - Nút chọn Size (S, M, L, XL), bộ đếm số lượng
          - Nút [ ADD TO SHOPPING BAG ] (kết nối trực tiếp Zustand store)
          ========================================================================= */}
      <section className="bg-white py-16 sm:py-24 border-b border-neutral-200">
        <div className="max-w-[1560px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-neutral-400 block mb-2 uppercase">
              SECTION 05 / ACQUIRE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 mb-2">
              THE PIECE
            </h2>
            <div className="w-12 h-0.5 bg-black mb-3" />
            <p className="text-xs sm:text-sm text-neutral-500 uppercase tracking-wider font-light">
              Secure your unit from this limited atelier production batch.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-neutral-50 border border-neutral-300 p-6 sm:p-10 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Ảnh sản phẩm mua sắm */}
              <div className="md:col-span-5 aspect-[3/4] bg-neutral-100 overflow-hidden border border-neutral-200">
                <img
                  src={primaryImg}
                  alt={story.setName}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Chi tiết chọn size & giỏ hàng */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block mb-1">
                    {story.brandInfo.name} / ATELIER EDITION
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-950 mb-2">
                    {story.setName}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-black">
                      {formatVND(price)}
                    </span>
                    {originalPrice && Number(originalPrice) > Number(price) && (
                      <span className="text-xs font-mono text-neutral-400 line-through">
                        {formatVND(originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Chọn Size & Nút Bảng Size (Size Matrix) */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono tracking-wider uppercase text-neutral-700 font-semibold">
                        SELECT SIZE
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        ({selectedSize})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSizeModal(true)}
                      className="text-[11px] font-mono text-black underline uppercase tracking-widest hover:text-neutral-500 transition-colors cursor-pointer"
                    >
                      SIZE MATRIX
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-11 text-xs font-mono font-bold uppercase transition-all cursor-pointer border ${
                          selectedSize === size
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bộ đếm số lượng */}
                <div>
                  <span className="text-xs font-mono tracking-wider uppercase text-neutral-700 block mb-2">
                    QUANTITY
                  </span>
                  <div className="inline-flex items-center border border-neutral-300 bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-sm font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-xs font-mono font-bold text-black">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-sm font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Nút Thao tác: ADD TO CART & CHECK OUT */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 sm:py-4 px-4 border border-black text-black bg-white hover:bg-neutral-100 text-[11px] font-bold uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>ADD TO CART</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    className="flex-1 py-3.5 sm:py-4 px-4 bg-black text-white hover:bg-neutral-800 text-[11px] font-bold uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <span>CHECK OUT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CUỐI TRANG: COMPLETED READING
          - 2 nút hành động:
            * [ EXIT ]: Chuyển về lại trang /explore
            * [ GO TO FASHORA PLATFORM ]: Chuyển về trang chủ /
          ========================================================================= */}
      <section className="py-20 sm:py-28 bg-white text-center">
        <div className="max-w-xl mx-auto px-6 flex flex-col items-center">
          <span className="text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase text-neutral-400 mb-2">
            EDITORIAL DOSSIER CONCLUDED
          </span>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 mb-8">
            COMPLETED READING
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <Link
              to="/explore"
              className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 border border-black text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300"
            >
              EXIT TO EXPLORE
            </Link>

            <Link
              to="/home"
              className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all duration-300 shadow-md"
            >
              GO TO FASHORA PLATFORM
            </Link>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      <Toast
        isVisible={Boolean(toastMessage)}
        message={toastMessage}
        onClose={() => setToastMessage('')}
        duration={3000}
      />

      {/* Modal Bảng Size (Size Matrix) */}
      <SizeMatrixModal
        isOpen={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        categoryType="set"
      />
    </div>
  );
}
