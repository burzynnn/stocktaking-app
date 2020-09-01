#!/bin/sh

echo -e "user default off\nuser stocktaking on -@all +@connection +SET +GET +DEL +INFO ~* >$REDIS_PASSWORD" > /usr/local/etc/redis/users.acl