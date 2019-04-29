DROP TABLE if exists `oden_users`;


create table `oden_users` (
	`id` int not null auto_increment,
    `username` text not null,
    `password` text not null,
    `email`    text,
    `created_at` timestamp default current_timestamp,
    `updated_at` timestamp default current_timestamp on update current_timestamp,
    primary key (`id`)
);