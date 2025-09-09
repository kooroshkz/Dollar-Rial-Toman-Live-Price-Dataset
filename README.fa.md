# دیتاست قیمت لحظه‌ای دلار ریال تومان
دیتاست جامع قیمت دلار به ریال از آبان ۱۳۹۰ تا امروز با قابلیت به روزرسانی خودکار روزانه برای تحلیل‌های مالی و اقتصادی، پیش‌بینی و پروژه‌های یادگیری ماشین.

---

## شماتیک دیتاست

* **بازه زمانی**: ۵ آذر ۱۳۹۰ تا امروز (به‌روزرسانی خودکار)
* **تعداد رکوردها**: بیش از ۳۶۴۸ داده
* **منبع داده**: سایت TGJU.org (اتحادیه طلا و جواهر تهران)
* **بسامد به‌روزرسانی**: روزانه (خودکار با GitHub Actions)
* **فرمت**: فایل CSV با ساختار عددی قیمت‌ها و تاریخ شمسی و میلادی

---

## ساختار داده

فایل CSV شامل ستون‌های زیر است:

| ستون           | توضیح             | فرمت       | مثال       |
| -------------- | ----------------- | ---------- | ---------- |
| Open Price     | قیمت باز شدن روز  | عدد صحیح   | 1012100    |
| Low Price      | کمترین قیمت روز   | عدد صحیح   | 1011700    |
| High Price     | بیشترین قیمت روز  | عدد صحیح   | 1034100    |
| Close Price    | قیمت بسته شدن روز | عدد صحیح   | 1029800    |
| Change Amount  | میزان تغییر قیمت  | متن       | 15400      |
| Change Percent | درصد تغییر قیمت   | متن       | 1.52%      |
| Gregorian Date | تاریخ میلادی      | YYYY/MM/DD | 2025/09/06 |
| Persian Date   | تاریخ شمسی        | YYYY/MM/DD | 1404/06/15 |

---

### دانلود داده

می‌توانید فایل دیتاست را به‌طور مستقیم از مسیر `/data/` دریافت کنید:

* [Dollar\_Rial\_Price\_Dataset.csv](data/Dollar_Rial_Price_Dataset.csv)

---

## مشاهده در Kaggle

این دیتاست همچنین در [Kaggle](https://www.kaggle.com/datasets/kooroshkz/dollar-rial-toman-live-price-dataset) در دسترس است و می‌توانید آن را به‌طور مستقیم در نوت‌بوک‌های Kaggle بارگذاری و استفاده کنید.

---

## نمودار قیمت و تحلیل تکنیکال

<a href="https://kooroshkz.github.io/Dollar-Rial-Toman-Live-Price-Dataset/" target="_blank">
  <img width="1170" height="981" alt="image" src="./assets/img/IntractiveChart.png" />
</a>  

نمودارهای تحلیل تکنیکال و شاخص های قیمتی در لینک زیر قابل دسترس هستند:
[kooroshkz.github.io/Dollar-Rial-Toman-Live-Price-Dataset](https://kooroshkz.github.io/Dollar-Rial-Toman-Live-Price-Dataset/)

---

## بارگذاری در پایتون

```python
import pandas as pd

# بارگذاری دیتاست
df = pd.read_csv('data/Dollar_Rial_Price_Dataset.csv')

# تبدیل تاریخ میلادی
df['Gregorian Date'] = pd.to_datetime(df['Gregorian Date'], format='%Y/%m/%d')

price_columns = ['Open Price', 'Low Price', 'High Price', 'Close Price']
print(df[price_columns].dtypes)  # همه int64 خواهند بود
```

---

## بارگذاری مستقیم در پایتون

```python
# pip install kagglehub[hf-datasets]
import kagglehub

df = kagglehub.load_dataset(
    "kooroshkz/dollar-rial-toman-live-price-dataset",
    adapter="huggingface",
    file_path="Dollar_Rial_Price_Dataset.csv",
    pandas_kwargs={"parse_dates": ["Gregorian Date"]}
)

print(df.head())
```

---

## بارگذاری در R

```r
# بارگذاری دیتاست
data <- read.csv("data/Dollar_Rial_Price_Dataset.csv", stringsAsFactors = FALSE)

# تبدیل تاریخ
data$Gregorian.Date <- as.Date(data$Gregorian.Date, format = "%Y/%m/%d")

# مشاهده ساختار داده
str(data)
```

---

## کیفیت داده و به‌روزرسانی‌ها

* **اعتبارسنجی**: تمام داده‌ها بررسی دقت می‌شوند
* **به‌روزرسانی خودکار**: هر روز ساعت ۸ صبح UTC
* **یکپارچگی داده‌ها**: جلوگیری از رکوردهای تکراری و خطای فرمت
* **سازگاری تاریخی**: فرمت یکنواخت در کل بازه زمانی

---

## پیاده‌سازی فنی

این دیتاست با یک سیستم وب‌اسکریپینگ خودکار مدیریت می‌شود که:

* نرخ‌های جدید را از TGJU.org دریافت می‌کند
* رکوردها را پردازش و اعتبارسنجی می‌کند
* مانع از ورود داده‌های تکراری می‌شود
* به‌طور خودکار در مخزن آپدیت می‌شود

---

## مشارکت

اگر خطایی در داده‌ها یافتید یا پیشنهادی برای بهبود دارید، لطفاً یک issue در گیت‌هاب باز کنید.

---

## مجوز

این پروژه تحت مجوز MIT منتشر شده است – برای جزئیات فایل [LICENSE](LICENSE) را ببینید.

---

## استناد

اگر از این دیتاست در پژوهش یا پروژه خود استفاده می‌کنید، لطفاً آن را به این شکل ذکر کنید:

```
Dollar-Rial-Toman Live Price Dataset
Author: Koorosh Komeili Zadeh
Source: https://github.com/kooroshkz/Dollar-Rial-Toman-Live-Price-Dataset
Data Source: TGJU.org (Tehran Gold & Jewelry Union)
Date Range: November 2011 - Present
```

---

### کلیدواژه‌ها

دیتاست دلار به ریال، دلار به تومان، نرخ ارز ایران CSV، USD/IRR، دیتاست نرخ ارز دلار ریال تومان، داده‌های TGJU، سری زمانی ارز

* در دسترس به [English](README.md) | [فارسی](README.fa.md)

---

## سلب مسئولیت

این دیتاست فقط برای اهداف آموزشی و پژوهشی ارائه شده است. نرخ ارز از منابع عمومی جمع‌آوری شده و برای تصمیم‌های مالی یا سرمایه‌گذاری باید به‌طور مستقل بررسی شود. توسعه دهندگان هیچ مسئولیتی در قبال خسارات مالی ناشی از استفاده از این داده‌ها ندارند.

