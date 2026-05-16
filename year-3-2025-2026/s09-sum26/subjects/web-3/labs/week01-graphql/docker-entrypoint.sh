# shebang Ä‘á»ƒ chá»‰ Ä‘á»‹nh trĂ¬nh thĂ´ng dá»‹ch, á»Ÿ Ä‘Ă¢y lĂ  sh (Bourne Shell) 
#!/bin/sh

# Dá»«ng script ngay láº­p tá»©c náº¿u cĂ³ lá»‡nh bá»‹ lá»—i 
set - e

echo "--- Running Migrations ---"
npm run migrate 

# Kiá»ƒm tra mĂ´i trÆ°á»ng Ä‘á»ƒ quyáº¿t Ä‘á»‹nh cĂ³ seed hay khĂ´ng 
if [ "$NEED_SEED" = "true" ]; then
    echo "--- Running Seeds ---"
    npm run seed
fi

# Start Server
echo "--- Starting Express Server ---"
# Suwr dujng exec Ä‘á»ƒ node trá»Ÿ thĂ nh PID 1, giĂºp nháº­n tĂ­n hiá»‡u SIGTERM/SIGINT chuáº©n xĂ¡c
exec "$@"