-- 土族盘绣纹样开放素材库 - 初始演示内容（先执行 schema.sql）
-- 说明：除明确标注的基础事实外，纹样、文献、共创和应用案例均为本地演示占位资料。
USE `tuzu_panxiu`;
SET NAMES utf8mb4;

-- 默认管理员：admin / password（仅限本地首次登录，登录后必须改密）
INSERT INTO `admin_user` (`id`,`username`,`password_hash`,`display_name`,`email`,`status`) VALUES
(1,'admin','$2b$10$9KFeI6d7cMA2ZtQzRjPT0u8A.yLAU9eIUTA5N.RtnTk7PyWxPqee6','系统管理员','admin@local.test','active');

INSERT INTO `site_setting` (`id`,`setting_key`,`setting_value`,`description`) VALUES
(1,'site_name',JSON_QUOTE('土族盘绣纹样开放素材库'),'网站名称'),
(2,'site_subtitle',JSON_QUOTE('面向非遗保护、纹样研究与设计应用的开放素材平台'),'网站副标题'),
(3,'contact',JSON_QUOTE('请在后台补充'),'联系方式'),
(4,'copyright',JSON_QUOTE('本平台内容仅用于学习、研究与展示，实际开放素材请以后续授权说明为准'),'版权说明'),
(5,'icp',JSON_QUOTE('待补充'),'备案信息');

-- 当前版本仅保留五类正式资源；不创建图库、专题、图案元素、工艺技法模块。
INSERT INTO `category` (`id`,`resource_type`,`parent_id`,`name`,`slug`,`description`,`sort_order`,`status`) VALUES
(1,'pattern',NULL,'纹样素材','pattern-material','盘绣纹样演示记录',10,'published'),
(2,'pattern',1,'花卉纹样','flower-pattern','花卉形态纹样',20,'published'),
(3,'pattern',1,'几何纹样','geometry-pattern','几何结构纹样',30,'published'),
(4,'pattern',1,'边饰纹样','border-pattern','连续边饰纹样',40,'published'),
(5,'pattern',1,'服饰纹样','costume-pattern','服饰部位纹样',50,'published'),
(6,'document',NULL,'文献资料','document-material','平台自建资料与整理说明',10,'published'),
(7,'creation',NULL,'共创作品','co-creation','共创展示占位内容',10,'published'),
(8,'inheritor',NULL,'传承人介绍','inheritor-profile','传承人基础资料',10,'published'),
(9,'application_case',NULL,'应用案例','application-example','非商业应用方向示例',10,'published');

INSERT INTO `tag` (`id`,`name`,`slug`,`description`,`status`,`sort_order`) VALUES
(1,'土族','tuzu','土族文化相关内容','published',10),(2,'盘绣','panxiu','盘绣相关内容','published',20),
(3,'青海','qinghai','青海地区相关内容','published',30),(4,'互助','huzhu','互助土族自治县相关内容','published',40),
(5,'非遗','intangible-heritage','非物质文化遗产相关内容','published',50),(6,'传统美术','traditional-art','传统美术类别','published',60),
(7,'纹样','pattern','纹样整理内容','published',70),(8,'刺绣','embroidery','刺绣工艺相关内容','published',80),
(9,'服饰','costume','服饰应用相关内容','published',90),(10,'花卉','flower','花卉题材','published',100),
(11,'几何','geometry','几何构成','published',110),(12,'边饰','border','边饰结构','published',120),
(13,'色彩','color','色彩整理','published',130),(14,'工艺','craft','工艺观察','published',140),
(15,'针法','stitch','针法整理','published',150),(16,'图案寓意','meaning','图案寓意说明','published',160),
(17,'数字化','digitization','数字化整理','published',170),(18,'素材库','material-library','开放素材库建设','published',180),
(19,'文献','document','平台资料条目','published',190),(20,'应用设计','design-application','设计应用方向','published',200);

INSERT INTO `banner` (`id`,`title`,`subtitle`,`image_url`,`link_url`,`link_text`,`status`,`sort_order`) VALUES
(1,'土族盘绣纹样开放素材库','整理、展示与检索土族盘绣数字资源','/uploads/placeholders/banner-panxiu.svg','/patterns','浏览纹样','published',1),
(2,'以数字方式保存盘绣纹样','从纹样、色彩、针法到文化寓意，构建可持续维护的开放素材库','/uploads/placeholders/banner-panxiu.svg','/about','了解平台','published',2),
(3,'从传统工艺到当代设计','让土族盘绣纹样在研究、教学与设计应用中被看见','/uploads/placeholders/banner-panxiu.svg','/applications','查看应用','published',3);

INSERT INTO `page_content` (`id`,`page_key`,`title`,`cover_image`,`description`,`content`,`tags`,`status`,`sort_order`,`is_featured`,`published_at`) VALUES
(1,'platform_intro','关于土族盘绣纹样开放素材库','/uploads/placeholders/banner-panxiu.svg','面向非遗保护、纹样研究、设计应用和文化传播的数字资源平台。','土族盘绣纹样开放素材库围绕土族盘绣的纹样图像、工艺信息、文献资料、传承内容与应用案例进行整理，支持分类浏览、关键词检索、标签筛选和素材下载。平台内容可通过后台持续补充和维护，适合用于教学展示、资料整理、设计参考和文化传播。\n\n资料依据：土族盘绣是中国国家级非物质文化遗产代表性项目，类别为传统美术，项目编号为Ⅶ—24，申报地区为青海省互助土族自治县。土族主要聚居于青海省东部地区，互助土族自治县是重要聚居地之一。','["土族","盘绣","非遗","素材库"]','published',10,1,'2026-07-04 09:00:00'),
(2,'about','关于平台','/uploads/placeholders/banner-panxiu.svg','以数字化方式整理传统纹样、工艺资料和文化信息。','本平台以土族盘绣为核心对象，尝试通过数字化方式对传统纹样、工艺资料和文化信息进行整理。平台不以交易为目的，不设置用户注册、订单、支付或授权申请流程，而是以展示、检索、管理和开放下载为主要功能。后续可根据实物采集、文献整理和田野调研资料持续完善内容。\n\n平台可从纹样、色彩、针法、服饰应用、图案寓意和数字化采集等角度整理素材。','["土族","盘绣","数字化","素材库"]','published',20,1,'2026-07-04 09:00:00'),
(3,'usage','素材使用说明','/uploads/placeholders/document-cover.svg','演示资料与后续真实资料的使用边界说明。','平台当前内容主要用于学习、研究、教学展示和非商业设计参考。部分素材为演示数据或占位素材，后续需要替换为经过整理和授权的真实图像、文献和附件。用户下载素材后，应尊重非物质文化遗产的文化语境，不应歪曲、滥用或商业化误用相关纹样。','["素材库","应用设计"]','published',30,0,'2026-07-04 09:00:00'),
(4,'culture','土族盘绣基础信息','/uploads/placeholders/pattern-flower.svg','用于首页文化区的基础事实说明。','土族盘绣是中国国家级非物质文化遗产代表性项目，项目类别为传统美术，项目编号为Ⅶ—24，申报地区为青海省互助土族自治县。土族主要聚居于青海省东部地区，互助土族自治县是重要聚居地之一。\n\n本页仅呈现资料包提供的基础事实，不替代专业研究成果。','["非遗","传统美术","青海","互助"]','published',40,1,'2026-07-04 09:00:00'),
(5,'footer','页脚说明',NULL,'土族盘绣纹样开放素材库','本平台内容仅用于学习、研究与展示，实际开放素材请以后续授权说明为准。','[]','published',50,0,'2026-07-04 09:00:00');

INSERT INTO `pattern` (`id`,`title`,`cover_image`,`category_id`,`source_area`,`application_part`,`craft_type`,`main_colors`,`meaning`,`description`,`content`,`tags`,`status`,`sort_order`,`is_featured`,`published_at`) VALUES
(1,'花卉盘绣纹样示例','/uploads/placeholders/pattern-flower.svg',2,'青海互助','服饰装饰','盘绣',JSON_ARRAY('#B84E44','#D6AA52','#315D85','#4F9188'),'生命、繁盛、美好生活','以花卉形态为基础的盘绣纹样示例，适合展示植物题材的装饰特征。','示例纹样记录：本条为构图与字段演示，不代表已采集的具体实物。后续应补充实物图片、采集编号、来源与授权信息。',JSON_ARRAY('土族','盘绣','花卉','纹样'), 'published',10,1,'2026-07-04 09:00:00'),
(2,'几何连续纹样示例','/uploads/placeholders/pattern-geometry.svg',3,'青海互助','衣领、袖口、边饰','盘绣',JSON_ARRAY('#315D85','#F1E4CC','#B84E44'),'秩序、连续、守护','以重复几何结构构成的边饰型纹样，适合作为基础图案参考。','示例纹样记录：重点展示重复、连接与节奏关系，后续需以真实采集资料核校。',JSON_ARRAY('盘绣','几何','边饰'), 'published',20,1,'2026-07-04 09:00:00'),
(3,'服饰边饰盘绣纹样示例','/uploads/placeholders/pattern-border.svg',4,'青海互助','服饰边缘','盘绣',JSON_ARRAY('#9F493F','#253E62','#D6AA52'),'装饰、边界、礼仪','用于服饰边缘装饰的盘绣纹样示例，强调连续排列和节奏感。','示例纹样记录：用于说明边饰类素材的整理方式，不对应具体文物。',JSON_ARRAY('盘绣','边饰','服饰'), 'published',30,1,'2026-07-04 09:00:00'),
(4,'盘绣服饰局部纹样示例','/uploads/placeholders/pattern-costume.svg',5,'青海互助','胸襟、衣袖','盘绣',JSON_ARRAY('#B84E44','#171C24','#D6AA52'),'身份、礼俗、节庆','围绕土族服饰局部装饰展开的纹样记录，用于展示盘绣与服饰结构的关系。','示例纹样记录：服饰部位与寓意为资料整理维度，正式发布前需结合实物与访谈资料核验。',JSON_ARRAY('土族','盘绣','服饰'), 'published',40,1,'2026-07-04 09:00:00'),
(5,'对称花形纹样示例','/uploads/placeholders/pattern-flower.svg',2,'青海东部','衣饰、包饰','盘绣',JSON_ARRAY('#B84E44','#4F9188','#D6AA52'),'和合、圆满、繁荣','以对称结构组织花形元素，适合用于观察盘绣纹样中的构图规律。','示例纹样记录：寓意为演示性整理词，不作为权威解释。',JSON_ARRAY('盘绣','花卉','图案寓意'), 'published',50,0,'2026-07-04 09:00:00'),
(6,'彩色线迹纹样示例','/uploads/placeholders/pattern-geometry.svg',1,'青海互助','局部装饰','盘绣',JSON_ARRAY('#B84E44','#D6AA52','#315D85','#4F9188'),'多彩生活、节庆氛围','突出线迹组织和色彩对比的盘绣纹样示例。','示例纹样记录：用于演示色彩、针法与局部结构字段，待补充真实线迹图片。',JSON_ARRAY('盘绣','色彩','针法'), 'published',60,0,'2026-07-04 09:00:00'),
(7,'边框组合纹样示例','/uploads/placeholders/pattern-border.svg',4,'青海互助','边框、袖口','盘绣',JSON_ARRAY('#253E62','#F1E4CC','#9F493F'),'守护、连接、秩序','适合作为卡片、资料页和素材库边饰展示的纹样示例。','示例纹样记录：用于展示边框组合逻辑，不授权作为商业成品。',JSON_ARRAY('盘绣','边饰','几何'), 'published',70,0,'2026-07-04 09:00:00'),
(8,'传统服饰装饰纹样示例','/uploads/placeholders/pattern-costume.svg',5,'青海互助','传统服饰','盘绣',JSON_ARRAY('#B84E44','#D6AA52','#315D85','#171C24'),'节庆、身份、美好祝愿','围绕传统服饰装饰需求整理的盘绣纹样示例，后续可替换为真实采集图像。','示例纹样记录：本条不对应具体人物、服装或馆藏。',JSON_ARRAY('土族','盘绣','服饰'), 'published',80,0,'2026-07-04 09:00:00');

INSERT INTO `pattern_image` (`id`,`pattern_id`,`image_url`,`alt_text`,`sort_order`) VALUES
(1,1,'/uploads/placeholders/pattern-flower.svg','花卉盘绣纹样占位图',10),(2,2,'/uploads/placeholders/pattern-geometry.svg','几何连续纹样占位图',10),
(3,3,'/uploads/placeholders/pattern-border.svg','服饰边饰纹样占位图',10),(4,4,'/uploads/placeholders/pattern-costume.svg','服饰局部纹样占位图',10);

INSERT INTO `document` (`id`,`title`,`cover_image`,`category_id`,`author`,`source`,`year`,`summary`,`description`,`content`,`tags`,`status`,`sort_order`,`is_featured`,`published_at`) VALUES
(1,'土族盘绣基础资料整理','/uploads/placeholders/document-cover.svg',6,'平台资料组','平台自建演示资料',2026,'汇总资料包提供的土族盘绣基础信息。','平台自建资料条目，不是正式出版论文。','资料依据：土族盘绣是中国国家级非物质文化遗产代表性项目，类别为传统美术，项目编号为Ⅶ—24，申报地区为青海省互助土族自治县。土族主要聚居于青海省东部地区，互助土族自治县是重要聚居地之一。',JSON_ARRAY('土族','盘绣','非遗','文献'),'published',10,1,'2026-07-04 09:00:00'),
(2,'土族盘绣纹样采集规范','/uploads/placeholders/document-cover.svg',6,'平台资料组','平台自建演示资料',2026,'纹样拍摄、编号、来源与授权信息的建议字段。','采集工作说明，不是正式行业标准。','建议记录采集编号、拍摄日期、来源地区、应用部位、工艺技法、主要色彩、图案寓意、文件版本、来源说明与授权状态。真实采集时应保留原始文件并建立核校记录。',JSON_ARRAY('盘绣','纹样','数字化','文献'),'published',20,1,'2026-07-04 09:00:00'),
(3,'土族盘绣数字素材命名规范','/uploads/placeholders/document-cover.svg',6,'平台资料组','平台自建演示资料',2026,'说明数字素材的文件命名与版本管理方式。','内部整理建议，不是正式出版物。','建议采用“资源类型-采集编号-视图-版本”结构命名，避免仅以人物姓名或含义推断命名。修改文件时保留版本号与变更说明。',JSON_ARRAY('盘绣','数字化','素材库'),'published',30,1,'2026-07-04 09:00:00'),
(4,'非遗纹样素材使用说明','/uploads/placeholders/document-cover.svg',6,'平台资料组','平台自建演示资料',2026,'说明学习、研究、展示与设计参考中的使用边界。','平台使用说明，不构成法律授权文件。','使用素材时应核对具体资源的来源和授权说明，尊重非遗文化语境，避免歪曲、滥用或未经许可的商业化使用。演示占位图不代表真实采集素材。',JSON_ARRAY('非遗','纹样','应用设计'),'published',40,0,'2026-07-04 09:00:00'),
(5,'土族盘绣与服饰装饰资料摘编','/uploads/placeholders/document-cover.svg',6,'平台资料组','平台自建演示资料',2026,'从应用部位角度整理盘绣与服饰装饰的观察维度。','平台整理提纲，不是正式论文摘录。','可从胸襟、衣袖、衣领、边缘等部位建立记录，并关联构图、色彩、线迹和文化说明。具体判断须以实物采集、文献与访谈资料为依据。',JSON_ARRAY('土族','盘绣','服饰','文献'),'published',50,0,'2026-07-04 09:00:00');

INSERT INTO `creation` (`id`,`title`,`cover_image`,`category_id`,`creator_name`,`creation_date`,`description`,`content`,`tags`,`status`,`sort_order`,`is_featured`,`published_at`) VALUES
(1,'盘绣纹样数字再设计示例','/uploads/placeholders/pattern-flower.svg',7,'平台演示内容',NULL,'基于占位纹样进行数字构图练习的共创展示。','本条为共创展示占位内容，不对应真实作者作品，也不表示已获得真实纹样的商业授权。',JSON_ARRAY('盘绣','数字化','应用设计'),'published',10,1,'2026-07-04 09:00:00'),
(2,'土族盘绣主题海报示例','/uploads/placeholders/application-cover.svg',7,'平台演示内容',NULL,'以盘绣色彩和几何节奏组织版面的海报方向示例。','本条仅说明设计方向，视觉素材为本地原创占位图。',JSON_ARRAY('土族','盘绣','应用设计'),'published',20,1,'2026-07-04 09:00:00'),
(3,'盘绣边饰字体版式示例','/uploads/placeholders/pattern-border.svg',7,'平台演示内容',NULL,'探索边饰结构与文字版式关系的占位展示。','本条不对应真实委托、作者或已发表作品。',JSON_ARRAY('盘绣','边饰','应用设计'),'published',30,0,'2026-07-04 09:00:00'),
(4,'传统纹样现代应用草案','/uploads/placeholders/pattern-geometry.svg',7,'平台演示内容',NULL,'记录传统纹样进入数字媒介时的应用思路。','草案仅用于教学和系统演示，后续需由创作者补充过程、署名与授权信息。',JSON_ARRAY('纹样','数字化','应用设计'),'published',40,0,'2026-07-04 09:00:00');

INSERT INTO `inheritor` (`id`,`title`,`cover_image`,`category_id`,`level`,`region`,`birth_year`,`description`,`content`,`tags`,`status`,`sort_order`,`is_featured`,`published_at`) VALUES
(1,'李发秀','/uploads/placeholders/inheritor-cover.svg',8,'国家级非物质文化遗产代表性项目代表性传承人','青海省互助土族自治县',NULL,'土族盘绣代表性传承人基础资料。','资料依据：国家级非物质文化遗产代表性项目代表性传承人列表中，李发秀对应项目为土族盘绣，类别为传统美术，地区为青海省互助土族自治县。本条不扩写未经资料包确认的生平信息，照片待补充并核验授权。',JSON_ARRAY('土族','盘绣','非遗','互助'),'published',10,1,'2026-07-04 09:00:00'),
(2,'土族盘绣传承人资料待补充','/uploads/placeholders/inheritor-cover.svg',8,'资料待补充','青海省',NULL,'用于后续录入地方传承人、工坊、合作单位和采集资料的占位记录。','待补充姓名、级别、地区、基础经历、资料来源、肖像授权与采集记录。当前不对应具体人物。',JSON_ARRAY('土族','盘绣'),'published',20,0,'2026-07-04 09:00:00');

INSERT INTO `application_case` (`id`,`title`,`cover_image`,`category_id`,`case_type`,`client_name`,`case_date`,`description`,`content`,`tags`,`status`,`sort_order`,`is_featured`,`published_at`) VALUES
(1,'盘绣纹样在网页视觉中的应用','/uploads/placeholders/application-cover.svg',9,'网页视觉','平台演示',NULL,'以纹样、边饰和色彩建立文化资源网站的视觉识别。','应用方向示例，不是已落地的商业案例。使用真实纹样前应核对来源、语境与授权。',JSON_ARRAY('盘绣','纹样','应用设计'),'published',10,1,'2026-07-04 09:00:00'),
(2,'盘绣边饰在海报设计中的应用','/uploads/placeholders/pattern-border.svg',9,'海报设计','平台演示',NULL,'以连续边饰建立版面秩序和视觉节奏。','应用方向示例，不对应真实客户或商业项目。',JSON_ARRAY('盘绣','边饰','应用设计'),'published',20,1,'2026-07-04 09:00:00'),
(3,'盘绣色彩在文创包装中的应用','/uploads/placeholders/application-cover.svg',9,'包装设计','平台演示',NULL,'从盘绣色彩对比关系出发进行包装配色练习。','应用方向示例，色彩值为演示整理，不替代真实样本的色彩采集。',JSON_ARRAY('盘绣','色彩','应用设计'),'published',30,1,'2026-07-04 09:00:00'),
(4,'盘绣图案元素在数字展陈中的应用','/uploads/placeholders/pattern-geometry.svg',9,'数字展陈','平台演示',NULL,'探索纹样在数字界面和展陈导视中的呈现方式。','应用方向示例，不冒充真实展览或合作案例。',JSON_ARRAY('盘绣','数字化','应用设计'),'published',40,0,'2026-07-04 09:00:00'),
(5,'盘绣纹样在教学素材中的应用','/uploads/placeholders/document-cover.svg',9,'教学展示','平台演示',NULL,'将纹样分类、色彩和结构整理为课堂观察材料。','应用方向示例，教师使用真实素材时仍需核对来源与许可范围。',JSON_ARRAY('盘绣','纹样','文献'),'published',50,0,'2026-07-04 09:00:00');

INSERT INTO `media_file` (`id`,`original_name`,`file_name`,`file_url`,`mime_type`,`file_type`,`file_size`) VALUES
(1,'演示素材下载说明.txt','material-readme.txt','/uploads/placeholders/material-readme.txt','text/plain','other',0);

-- 下载附件只绑定部分内容；未列出的资源不会显示下载按钮。
INSERT INTO `download_file` (`id`,`resource_type`,`resource_id`,`file_name`,`file_url`,`file_type`,`file_size`,`download_count`) VALUES
(1,'pattern',1,'花卉盘绣纹样演示说明.txt','/uploads/placeholders/material-readme.txt','txt',0,0),
(2,'pattern',2,'几何连续纹样演示说明.txt','/uploads/placeholders/material-readme.txt','txt',0,0),
(3,'document',1,'土族盘绣基础资料整理说明.txt','/uploads/placeholders/material-readme.txt','txt',0,0),
(4,'document',2,'纹样采集规范演示说明.txt','/uploads/placeholders/material-readme.txt','txt',0,0),
(5,'document',3,'数字素材命名规范演示说明.txt','/uploads/placeholders/material-readme.txt','txt',0,0),
(6,'application_case',1,'网页视觉应用演示说明.txt','/uploads/placeholders/material-readme.txt','txt',0,0),
(7,'application_case',2,'海报设计应用演示说明.txt','/uploads/placeholders/material-readme.txt','txt',0,0);
